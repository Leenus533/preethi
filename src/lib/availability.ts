import { AVAILABILITY, type TimeWindow } from "./config";
import { addDays, diffDays, parseHm, parseYmd, ymdOf, ymdToString, zonedToUtc, type Ymd } from "./time";

/** Half-open interval in epoch milliseconds. */
export type Interval = { start: number; end: number };

export type SlotMap = Record<string, string[]>; // "YYYY-MM-DD" -> ISO start instants

export type AvailabilityConfig = {
  timezone: string;
  weekly: Record<number, TimeWindow[]>;
  slotIntervalMinutes: number;
  bufferMinutes: number;
  minNoticeHours: number;
  maxDaysAhead: number;
};

export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && a.end > b.start;
}

/**
 * Compute bookable start times for every date in [from, to] (inclusive, dates in tz).
 * Pure: pass `now` and `busy` explicitly so it can be unit tested.
 */
export function computeSlots(opts: {
  from: Ymd;
  to: Ymd;
  durationMinutes: number;
  busy: Interval[];
  now: number;
  config?: AvailabilityConfig;
}): SlotMap {
  const cfg = opts.config ?? AVAILABILITY;
  const { from, to, durationMinutes, busy, now } = opts;
  const durationMs = durationMinutes * 60_000;
  const bufferMs = cfg.bufferMinutes * 60_000;
  const earliest = now + cfg.minNoticeHours * 3_600_000;
  const lastDate = addDays(ymdOf(now, cfg.timezone), cfg.maxDaysAhead);

  // Pre-expand busy intervals by the buffer so a slot cannot touch an existing event.
  const blocked = busy
    .map((b) => ({ start: b.start - bufferMs, end: b.end + bufferMs }))
    .sort((a, b) => a.start - b.start);

  const out: SlotMap = {};
  const days = diffDays(from, to);
  if (days < 0) return out;

  for (let i = 0; i <= days; i++) {
    const day = addDays(from, i);
    if (diffDays(lastDate, day) > 0) break; // beyond horizon
    const weekday = new Date(Date.UTC(day.y, day.m - 1, day.d)).getUTCDay();
    const windows = cfg.weekly[weekday] ?? [];
    const slots: string[] = [];

    for (const [startHm, endHm] of windows) {
      const s = parseHm(startHm);
      const e = parseHm(endHm);
      const winStart = zonedToUtc(day.y, day.m, day.d, s.h, s.mi, cfg.timezone).getTime();
      const winEnd = zonedToUtc(day.y, day.m, day.d, e.h, e.mi, cfg.timezone).getTime();
      for (let t = winStart; t + durationMs <= winEnd; t += cfg.slotIntervalMinutes * 60_000) {
        if (t < earliest) continue;
        const slot: Interval = { start: t, end: t + durationMs };
        if (blocked.some((b) => overlaps(slot, b))) continue;
        slots.push(new Date(t).toISOString());
      }
    }
    if (slots.length) out[ymdToString(day)] = [...new Set(slots)].sort();
  }
  return out;
}

/** True when `startIso` is one of the offered slots for its date. */
export function isSlotOffered(slotMap: SlotMap, startIso: string, tz: string): boolean {
  const t = Date.parse(startIso);
  if (Number.isNaN(t)) return false;
  const key = ymdToString(ymdOf(t, tz));
  return (slotMap[key] ?? []).includes(new Date(t).toISOString());
}

/** Validate a YYYY-MM-DD query param and return parts. */
export function parseDateParam(value: string | null): Ymd | null {
  if (!value) return null;
  return parseYmd(value);
}

/** The UTC range that covers the local dates [from, to] inclusive. */
export function dateRangeToInstants(from: Ymd, to: Ymd, tz: string): { timeMin: Date; timeMax: Date } {
  const timeMin = zonedToUtc(from.y, from.m, from.d, 0, 0, tz);
  const next = addDays(to, 1);
  const timeMax = zonedToUtc(next.y, next.m, next.d, 0, 0, tz);
  return { timeMin, timeMax };
}
