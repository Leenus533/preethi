/**
 * Minimal Google Calendar client using a long-lived OAuth refresh token.
 * No SDK: plain fetch against the REST API, which keeps the serverless bundle small.
 *
 * The calendar is the single source of truth for bookings:
 *  - existing events (and events on any extra "busy" calendars) block slots
 *  - a HOLD event is created while a student is paying, and removed if they do not
 *  - the HOLD is turned into the confirmed booking by the Stripe webhook
 */
import { AVAILABILITY, SITE, TIMEZONE } from "./config";
import type { Interval } from "./availability";
import { formatDateTime, zonedToUtc, parseYmd } from "./time";

const API = "https://www.googleapis.com/calendar/v3";

export class GoogleError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "GoogleError";
  }
}

function cfg() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN ?? "",
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
    busyCalendarIds: (process.env.GOOGLE_BUSY_CALENDAR_IDS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export function isGoogleConfigured(): boolean {
  const c = cfg();
  return Boolean(c.clientId && c.clientSecret && c.refreshToken);
}

let tokenCache: { token: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) return tokenCache.token;
  const c = cfg();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: c.clientId,
      client_secret: c.clientSecret,
      refresh_token: c.refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !json.access_token) {
    throw new GoogleError(`Google token refresh failed: ${json.error ?? res.status}`, res.status, json);
  }
  tokenCache = { token: json.access_token, expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000 };
  return tokenCache.token;
}

async function gfetch<T>(path: string, init: RequestInit & { query?: Record<string, string | string[]> } = {}): Promise<T> {
  const url = new URL(API + path);
  for (const [k, v] of Object.entries(init.query ?? {})) {
    if (Array.isArray(v)) v.forEach((x) => url.searchParams.append(k, x));
    else url.searchParams.set(k, v);
  }
  const token = await accessToken();
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const json = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    const msg = (json as { error?: { message?: string } })?.error?.message ?? res.statusText;
    throw new GoogleError(`Google Calendar ${init.method ?? "GET"} ${path} failed: ${res.status} ${msg}`, res.status, json);
  }
  return json as T;
}

/* ---------- Types (subset of the Calendar API) ---------- */

export type GEventTime = { dateTime?: string; date?: string; timeZone?: string };

export type GEvent = {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  start?: GEventTime;
  end?: GEventTime;
  transparency?: "opaque" | "transparent";
  created?: string;
  hangoutLink?: string;
  htmlLink?: string;
  attendees?: { email: string; self?: boolean; responseStatus?: string; displayName?: string }[];
  extendedProperties?: { private?: Record<string, string>; shared?: Record<string, string> };
  conferenceData?: { entryPoints?: { entryPointType: string; uri: string }[] };
};

/* ---------- Reading availability ---------- */

const PROP_HOLD = "tutoringHold";
const PROP_HOLD_EXPIRES = "holdExpiresAt";
const PROP_BOOKING_REF = "bookingRef";
const PROP_BOOKING = "tutoringBooking";
const PROP_SERVICE_ID = "serviceId";
const PROP_SERVICE_NAME = "serviceName";
const PROP_STUDENT_EMAIL = "studentEmail";
const PROP_PRICE_PENCE = "pricePence";

/** Google Calendar renders event descriptions as HTML, so user-supplied text must be escaped. */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
/** Summaries are plain text but strip control characters and angle brackets to be safe. */
function cleanSummary(text: string): string {
  return text.replace(/[<>\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim();
}

export function isExpiredHold(ev: GEvent, now: number): boolean {
  const p = ev.extendedProperties?.private;
  if (!p || p[PROP_HOLD] !== "1") return false;
  const exp = Date.parse(p[PROP_HOLD_EXPIRES] ?? "");
  return !Number.isNaN(exp) && exp < now;
}

function eventInterval(ev: GEvent, tz: string): Interval | null {
  const s = ev.start;
  const e = ev.end;
  if (!s || !e) return null;
  if (s.dateTime && e.dateTime) {
    const start = Date.parse(s.dateTime);
    const end = Date.parse(e.dateTime);
    if (Number.isNaN(start) || Number.isNaN(end)) return null;
    return { start, end };
  }
  if (s.date && e.date) {
    const a = parseYmd(s.date);
    const b = parseYmd(e.date);
    if (!a || !b) return null;
    return {
      start: zonedToUtc(a.y, a.m, a.d, 0, 0, tz).getTime(),
      end: zonedToUtc(b.y, b.m, b.d, 0, 0, tz).getTime(),
    };
  }
  return null;
}

/** Whether an event should block bookings. Mirrors Google's own free/busy rules plus our hold logic. */
export function eventBlocks(ev: GEvent, now: number): boolean {
  if (ev.status === "cancelled") return false;
  if (ev.transparency === "transparent") return false;
  const self = ev.attendees?.find((a) => a.self);
  if (self?.responseStatus === "declined") return false;
  if (isExpiredHold(ev, now)) return false;
  return true;
}

async function listEvents(calendarId: string, timeMin: Date, timeMax: Date): Promise<GEvent[]> {
  const items: GEvent[] = [];
  let pageToken: string | undefined;
  do {
    const page = await gfetch<{ items?: GEvent[]; nextPageToken?: string }>(
      `/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        query: {
          singleEvents: "true",
          orderBy: "startTime",
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          maxResults: "2500",
          fields: "nextPageToken,items(id,status,summary,start,end,transparency,created,attendees(self,responseStatus),extendedProperties)",
          ...(pageToken ? { pageToken } : {}),
        },
      },
    );
    items.push(...(page.items ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);
  return items;
}

/** Busy intervals across the booking calendar and any additional busy calendars. */
export async function getBusyIntervals(timeMin: Date, timeMax: Date, now = Date.now()): Promise<Interval[]> {
  const c = cfg();
  const tz = TIMEZONE;
  const busy: Interval[] = [];

  const events = await listEvents(c.calendarId, timeMin, timeMax);
  const expiredHolds: string[] = [];
  for (const ev of events) {
    if (isExpiredHold(ev, now) && ev.status !== "cancelled") expiredHolds.push(ev.id);
    if (!eventBlocks(ev, now)) continue;
    const iv = eventInterval(ev, tz);
    if (iv) busy.push(iv);
  }
  // Housekeeping: remove holds whose checkout has long expired so they do not clutter the calendar.
  // Best effort and not awaited beyond this request; a failure just leaves an ignored event behind.
  if (expiredHolds.length) {
    await Promise.allSettled(expiredHolds.slice(0, 10).map((id) => deleteEvent(id)));
  }

  if (c.busyCalendarIds.length) {
    const fb = await gfetch<{ calendars?: Record<string, { busy?: { start: string; end: string }[] }> }>("/freeBusy", {
      method: "POST",
      body: JSON.stringify({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: tz,
        items: c.busyCalendarIds.map((id) => ({ id })),
      }),
    });
    for (const cal of Object.values(fb.calendars ?? {})) {
      for (const b of cal.busy ?? []) busy.push({ start: Date.parse(b.start), end: Date.parse(b.end) });
    }
  }
  return busy;
}

/* ---------- Holds and bookings ---------- */

export type BookingDetails = {
  bookingRef: string;
  serviceId: string;
  serviceName: string;
  start: Date;
  end: Date;
  studentName: string;
  studentEmail: string;
  parentName?: string;
  yearGroup?: string;
  notes?: string;
  pricePence: number;
  paymentRef?: string;
};

export type ConfirmedBooking = {
  eventId: string;
  meetLink?: string;
  htmlLink?: string;
  alreadyExisted: boolean;
  /** The slot overlapped another event when the booking was written (payment landed after the hold expired). */
  clash: boolean;
};

/**
 * Create a short-lived HOLD event so nobody else can book the same slot while payment is taken.
 * Returns the event id, or throws GoogleError with status 409 if the slot was taken in the meantime.
 */
export async function createHold(opts: { serviceName: string; start: Date; end: Date; bookingRef: string }): Promise<string> {
  const c = cfg();
  const now = Date.now();
  const expiresAt = new Date(now + AVAILABILITY.holdMinutes * 60_000).toISOString();

  const created = await gfetch<GEvent>(`/calendars/${encodeURIComponent(c.calendarId)}/events`, {
    method: "POST",
    body: JSON.stringify({
      summary: cleanSummary(`HOLD (awaiting payment): ${opts.serviceName}`),
      description: `Temporary hold created by the booking site. It disappears automatically if payment is not completed within ${AVAILABILITY.holdMinutes} minutes.`,
      start: { dateTime: opts.start.toISOString(), timeZone: TIMEZONE },
      end: { dateTime: opts.end.toISOString(), timeZone: TIMEZONE },
      transparency: "opaque",
      colorId: "8",
      reminders: { useDefault: false, overrides: [] },
      extendedProperties: {
        private: { [PROP_HOLD]: "1", [PROP_HOLD_EXPIRES]: expiresAt, [PROP_BOOKING_REF]: opts.bookingRef },
      },
    }),
  });

  // Optimistic concurrency: if any other blocking event overlaps and was created before ours, back off.
  let conflict: GEvent | undefined;
  try {
    conflict = await findConflict({ start: opts.start, end: opts.end, ignoreEventId: created.id, now, olderThan: Date.parse(created.created ?? "") || now });
  } catch (e) {
    await deleteEvent(created.id).catch(() => undefined);
    throw e;
  }
  if (conflict) {
    await deleteEvent(created.id).catch(() => undefined);
    throw new GoogleError("That time was just booked by someone else.", 409);
  }
  return created.id;
}

/** Find a blocking event that overlaps [start, end] (plus buffer), excluding `ignoreEventId`. */
async function findConflict(opts: { start: Date; end: Date; ignoreEventId?: string; now: number; olderThan?: number }): Promise<GEvent | undefined> {
  const c = cfg();
  const buffer = AVAILABILITY.bufferMinutes * 60_000;
  const others = await listEvents(c.calendarId, new Date(opts.start.getTime() - buffer), new Date(opts.end.getTime() + buffer));
  return others.find((ev) => {
    if (ev.id === opts.ignoreEventId || !eventBlocks(ev, opts.now)) return false;
    const iv = eventInterval(ev, TIMEZONE);
    if (!iv) return false;
    const touches = iv.start < opts.end.getTime() + buffer && iv.end > opts.start.getTime() - buffer;
    if (!touches) return false;
    if (opts.olderThan === undefined) return true;
    const theirCreated = Date.parse(ev.created ?? "") || 0;
    return theirCreated <= opts.olderThan;
  });
}

export async function deleteEvent(eventId: string): Promise<void> {
  const c = cfg();
  try {
    await gfetch<void>(`/calendars/${encodeURIComponent(c.calendarId)}/events/${encodeURIComponent(eventId)}`, {
      method: "DELETE",
      query: { sendUpdates: "none" },
    });
  } catch (e) {
    if (e instanceof GoogleError && (e.status === 404 || e.status === 410)) return; // already gone
    throw e;
  }
}

export async function releaseHold(eventId: string): Promise<void> {
  const ev = await getEvent(eventId);
  // Never delete something that has already become a confirmed booking.
  if (!ev || ev.extendedProperties?.private?.[PROP_BOOKING] === "1") return;
  await deleteEvent(eventId);
}

export async function getEvent(eventId: string): Promise<GEvent | null> {
  const c = cfg();
  try {
    const ev = await gfetch<GEvent>(`/calendars/${encodeURIComponent(c.calendarId)}/events/${encodeURIComponent(eventId)}`);
    return ev.status === "cancelled" ? null : ev;
  } catch (e) {
    if (e instanceof GoogleError && (e.status === 404 || e.status === 410)) return null;
    throw e;
  }
}

/** The HOLD event for a booking reference, if it has not already become a confirmed booking. */
export async function findHoldByRef(bookingRef: string): Promise<GEvent | null> {
  const c = cfg();
  const page = await gfetch<{ items?: GEvent[] }>(`/calendars/${encodeURIComponent(c.calendarId)}/events`, {
    query: {
      privateExtendedProperty: [`${PROP_BOOKING_REF}=${bookingRef}`, `${PROP_HOLD}=1`],
      maxResults: "5",
      fields: "items(id,status,extendedProperties)",
    },
  });
  return (page.items ?? []).find((e) => e.status !== "cancelled") ?? null;
}

export async function findBookingByRef(bookingRef: string): Promise<GEvent | null> {
  const c = cfg();
  const page = await gfetch<{ items?: GEvent[] }>(`/calendars/${encodeURIComponent(c.calendarId)}/events`, {
    query: {
      privateExtendedProperty: [`${PROP_BOOKING_REF}=${bookingRef}`, `${PROP_BOOKING}=1`],
      maxResults: "5",
      fields: "items(id,status,summary,start,end,hangoutLink,htmlLink,conferenceData,extendedProperties)",
    },
  });
  return (page.items ?? []).find((e) => e.status !== "cancelled") ?? null;
}

export function serviceNameOf(ev: GEvent | null | undefined): string | undefined {
  return ev?.extendedProperties?.private?.[PROP_SERVICE_NAME];
}

export function pricePenceOf(ev: GEvent | null | undefined): number | undefined {
  const v = Number(ev?.extendedProperties?.private?.[PROP_PRICE_PENCE]);
  return Number.isFinite(v) ? v : undefined;
}

/** Number of HOLD events that have not expired yet (anywhere in the future). Used to cap hold floods. */
export async function countActiveHolds(now = Date.now()): Promise<number> {
  const c = cfg();
  const page = await gfetch<{ items?: GEvent[] }>(`/calendars/${encodeURIComponent(c.calendarId)}/events`, {
    query: {
      privateExtendedProperty: [`${PROP_HOLD}=1`],
      timeMin: new Date(now).toISOString(),
      singleEvents: "true",
      maxResults: "250",
      fields: "items(id,status,extendedProperties)",
    },
  });
  return (page.items ?? []).filter((ev) => ev.status !== "cancelled" && !isExpiredHold(ev, now)).length;
}

/** Count confirmed bookings matching the given filters within [timeMin, timeMax]. */
export async function countBookings(opts: { serviceId?: string; studentEmail?: string; timeMin: Date; timeMax: Date }): Promise<number> {
  const c = cfg();
  const props = [`${PROP_BOOKING}=1`];
  if (opts.serviceId) props.push(`${PROP_SERVICE_ID}=${opts.serviceId}`);
  if (opts.studentEmail) props.push(`${PROP_STUDENT_EMAIL}=${opts.studentEmail.toLowerCase()}`);
  const page = await gfetch<{ items?: GEvent[] }>(`/calendars/${encodeURIComponent(c.calendarId)}/events`, {
    query: {
      privateExtendedProperty: props,
      timeMin: opts.timeMin.toISOString(),
      timeMax: opts.timeMax.toISOString(),
      singleEvents: "true",
      maxResults: "250",
      fields: "items(id,status)",
    },
  });
  return (page.items ?? []).filter((ev) => ev.status !== "cancelled").length;
}

export function meetLinkOf(ev: GEvent | null | undefined): string | undefined {
  if (!ev) return undefined;
  return ev.hangoutLink ?? ev.conferenceData?.entryPoints?.find((p) => p.entryPointType === "video")?.uri;
}

function bookingDescription(b: BookingDetails): string {
  const e = escapeHtml;
  const lines = [
    `${e(b.serviceName)} with Preethi Amudhan`,
    `When: ${formatDateTime(b.start, TIMEZONE)} (UK time)`,
    "",
    `Student: ${e(b.studentName)}`,
    `Email: ${e(b.studentEmail)}`,
  ];
  if (b.parentName) lines.push(`Parent/guardian: ${e(b.parentName)}`);
  if (b.yearGroup) lines.push(`Year group / stage: ${e(b.yearGroup)}`);
  if (b.notes) lines.push("", "Notes from the student:", e(b.notes));
  lines.push("", b.pricePence ? `Paid: £${(b.pricePence / 100).toFixed(2)}` : "Free session");
  if (b.paymentRef) lines.push(`Payment reference: ${e(b.paymentRef)}`);
  lines.push(`Booking reference: ${b.bookingRef}`);
  lines.push("", `Join with the Google Meet link on this event. Please give at least ${SITE.cancellationNoticeHours} hours' notice to reschedule.`);
  return lines.join("\n");
}

/**
 * Turn a hold into a confirmed booking (or create the booking outright).
 * Idempotent on bookingRef: calling twice returns the existing event.
 */
export async function confirmBooking(b: BookingDetails, holdEventId?: string): Promise<ConfirmedBooking> {
  const c = cfg();
  const existing = await findBookingByRef(b.bookingRef);
  if (existing) {
    return { eventId: existing.id, meetLink: meetLinkOf(existing), htmlLink: existing.htmlLink, alreadyExisted: true, clash: (existing.summary ?? "").startsWith("CLASH:") };
  }

  // If payment landed after the hold expired, someone else may have taken the slot in between.
  // We still record the booking (the student has paid and needs an invitation) but flag it loudly for Preethi.
  const clash = await findConflict({ start: b.start, end: b.end, ignoreEventId: holdEventId, now: Date.now() });
  const clashNote = clash
    ? `\n\n*** DOUBLE BOOKING *** This slot overlaps "${escapeHtml(clash.summary ?? "another event")}" because payment completed after the temporary hold expired. Please contact the student to rearrange.`
    : "";

  const body = {
    summary: cleanSummary(`${clash ? "CLASH: " : ""}${b.serviceName}: ${b.studentName}`),
    description: bookingDescription(b) + clashNote,
    start: { dateTime: b.start.toISOString(), timeZone: TIMEZONE },
    end: { dateTime: b.end.toISOString(), timeZone: TIMEZONE },
    transparency: "opaque",
    colorId: clash ? "11" : "10",
    attendees: [{ email: b.studentEmail, displayName: b.studentName }],
    guestsCanInviteOthers: false,
    guestsCanSeeOtherGuests: false,
    reminders: { useDefault: false, overrides: [{ method: "email", minutes: 24 * 60 }, { method: "popup", minutes: 30 }] },
    conferenceData: { createRequest: { requestId: `meet-${b.bookingRef}`, conferenceSolutionKey: { type: "hangoutsMeet" } } },
    extendedProperties: {
      private: {
        [PROP_BOOKING]: "1",
        [PROP_BOOKING_REF]: b.bookingRef,
        [PROP_HOLD]: "0",
        [PROP_SERVICE_ID]: b.serviceId,
        [PROP_SERVICE_NAME]: b.serviceName.slice(0, 200),
        [PROP_STUDENT_EMAIL]: b.studentEmail.toLowerCase().slice(0, 200),
        [PROP_PRICE_PENCE]: String(b.pricePence),
      },
    },
  };

  const query = { conferenceDataVersion: "1", sendUpdates: "all" };
  const base = `/calendars/${encodeURIComponent(c.calendarId)}/events`;

  let ev: GEvent | null = null;
  if (holdEventId) {
    const hold = await getEvent(holdEventId);
    if (hold) {
      ev = await gfetch<GEvent>(`${base}/${encodeURIComponent(holdEventId)}`, { method: "PATCH", query, body: JSON.stringify(body) });
    }
  }
  if (!ev) {
    ev = await gfetch<GEvent>(base, { method: "POST", query, body: JSON.stringify(body) });
  }
  return { eventId: ev.id, meetLink: meetLinkOf(ev), htmlLink: ev.htmlLink, alreadyExisted: false, clash: Boolean(clash) };
}

/** Light connectivity check used by /api/health. Deliberately returns no identifying details. */
export async function calendarHealth(): Promise<{ ok: true; timeZone?: string } | { ok: false; status?: number }> {
  try {
    const c = cfg();
    const cal = await gfetch<{ timeZone?: string }>(`/calendars/${encodeURIComponent(c.calendarId)}`);
    return { ok: true, timeZone: cal.timeZone };
  } catch (e) {
    console.error("calendar health check failed", e);
    return { ok: false, status: e instanceof GoogleError ? e.status : undefined };
  }
}
