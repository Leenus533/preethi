"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import type { Service } from "@/lib/config";
import { formatPrice } from "@/lib/config";
import { validateBookingInput } from "@/lib/booking-schema";
import { Icon } from "@/components/ui/icons";

type SlotMap = Record<string, string[]>;
type AvailabilityResponse = { timezone: string; source: "calendar" | "hours-only"; slots: SlotMap; minNoticeHours: number; maxDaysAhead: number };

type Props = {
  services: Service[];
  timezone: string;
  contactEmail: string;
  phone?: string;
  phoneE164?: string;
  blockDiscountPercent: number;
  cancellationNoticeHours: number;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

async function fetchAvailability(sid: string, y: number, m: number, signal: AbortSignal): Promise<AvailabilityResponse> {
  const from = ymd(y, m, 1);
  const to = ymd(y, m, daysInMonth(y, m));
  const res = await fetch(`/api/availability?serviceId=${encodeURIComponent(sid)}&from=${from}&to=${to}`, { signal, cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as AvailabilityResponse & { error?: string };
  if (!res.ok) throw new Error(data.error || "Could not load availability.");
  return data;
}

const subscribeNoop = () => () => {};
function getViewerTz(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}
const getServerTz = () => null;

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function ymd(y: number, m: number, d: number) {
  return `${y}-${pad(m)}-${pad(d)}`;
}
function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
/** Today's date in the given timezone as {y,m,d}. */
function todayIn(tz: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}
function fmtTime(iso: string, tz: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
}
function dateKeyIn(iso: string, tz: string) {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(iso));
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${g("year")}-${g("month")}-${g("day")}`;
}
/** Local time, prefixed with the weekday and day when the viewer's calendar date differs from the London one. */
function fmtLocalSlot(iso: string, viewer: string, base: string) {
  const time = fmtTime(iso, viewer);
  if (dateKeyIn(iso, viewer) === dateKeyIn(iso, base)) return `${time} local`;
  const day = new Intl.DateTimeFormat("en-GB", { timeZone: viewer, weekday: "short", day: "numeric", month: "short" }).format(new Date(iso));
  return `${day}, ${time} local`;
}
function fmtLong(iso: string, tz: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(
    new Date(iso),
  );
}
function fmtDayHeading(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function BookingWizard({ services, timezone, contactEmail, phone, phoneE164, blockDiscountPercent, cancellationNoticeHours }: Props) {
  // Query string: ?service= preselects a session type; ?cancelled=1&ref= means the student backed out of Stripe Checkout.
  const query = useSearchParams();
  const initialServiceId = query.get("service") ?? undefined;
  const cancelled = query.get("cancelled") === "1";
  const cancelledRef = query.get("ref") ?? undefined;
  const initialService = services.find((s) => s.id === initialServiceId);
  const [step, setStep] = useState<1 | 2 | 3>(initialService ? 2 : 1);
  const [serviceId, setServiceId] = useState<string | undefined>(initialService?.id);
  const service = services.find((s) => s.id === serviceId);

  const today = useMemo(() => todayIn(timezone), [timezone]);
  const [month, setMonth] = useState({ y: today.y, m: today.m });
  const [slotsByMonth, setSlotsByMonth] = useState<Record<string, SlotMap>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [source, setSource] = useState<"calendar" | "hours-only" | null>(null);
  const [maxDaysAhead, setMaxDaysAhead] = useState(60);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", parentName: "", yearGroup: "", notes: "", website: "", agree: false });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Browser timezone, read hydration-safely (null on the server and during hydration).
  const viewerTz = useSyncExternalStore(subscribeNoop, getViewerTz, getServerTz);
  const showViewerTz = Boolean(viewerTz && viewerTz !== timezone);

  // A student who backs out of Stripe Checkout should not leave their slot blocked.
  useEffect(() => {
    if (!cancelled || !cancelledRef) return;
    void fetch("/api/cancel-hold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: cancelledRef }),
      keepalive: true,
    }).catch(() => undefined);
  }, [cancelled, cancelledRef]);

  // Move focus to the step heading whenever the step changes, so keyboard and screen-reader users are not stranded.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const monthKey = `${month.y}-${pad(month.m)}`;
  const slots = slotsByMonth[`${serviceId}:${monthKey}`];
  const loading = step === 2 && Boolean(serviceId) && !slots && !loadError;

  useEffect(() => {
    if (!serviceId || step !== 2 || loadError) return;
    const key = `${serviceId}:${monthKey}`;
    if (slotsByMonth[key]) return;
    const ctrl = new AbortController();
    fetchAvailability(serviceId, month.y, month.m, ctrl.signal)
      .then((data) => {
        setSlotsByMonth((prev) => ({ ...prev, [key]: data.slots }));
        setSource(data.source);
        if (data.maxDaysAhead) setMaxDaysAhead(data.maxDaysAhead);
      })
      .catch((e: Error) => {
        if (e.name === "AbortError") return;
        setLoadError(e.message || "Could not load availability.");
      });
    return () => ctrl.abort();
  }, [serviceId, step, month.y, month.m, monthKey, slotsByMonth, loadError]);

  function chooseService(id: string) {
    setServiceId(id);
    setLoadError(null);
    setSelectedDay(null);
    setSelectedSlot(null);
    setStep(2);
  }

  const canGoPrev = month.y > today.y || (month.y === today.y && month.m > today.m);
  const maxMonth = useMemo(() => {
    const t = new Date(Date.UTC(today.y, today.m - 1, today.d + maxDaysAhead));
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1 };
  }, [today, maxDaysAhead]);
  const canGoNext = month.y < maxMonth.y || (month.y === maxMonth.y && month.m < maxMonth.m);

  function shiftMonth(delta: number) {
    const t = new Date(Date.UTC(month.y, month.m - 1 + delta, 1));
    setMonth({ y: t.getUTCFullYear(), m: t.getUTCMonth() + 1 });
    setSelectedDay(null);
    setSelectedSlot(null);
    setLoadError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!service || !selectedSlot) return;
    const v = validateBookingInput({ ...form, serviceId: service.id, start: selectedSlot });
    const errs = v.ok ? {} : { ...v.errors };
    if (!form.agree) errs.agree = "Please confirm you have read the terms.";
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      const first = ["name", "email", "parentName", "yearGroup", "notes", "agree"].find((k) => errs[k]);
      if (first) document.getElementById(`field-${first}`)?.focus();
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, serviceId: service.id, start: selectedSlot }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string; errors?: Record<string, string>; code?: string };
      if (!res.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
          const first = Object.keys(data.errors)[0];
          if (first) document.getElementById(`field-${first}`)?.focus();
        }
        if (data.code === "slot_taken") {
          // Refresh availability so the taken slot disappears.
          setSlotsByMonth((prev) => {
            const next = { ...prev };
            delete next[`${service.id}:${monthKey}`];
            return next;
          });
          setSelectedSlot(null);
          setStep(2);
        }
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      if (!data.url) throw new Error("No redirect URL returned.");
      window.location.assign(data.url);
    } catch (err) {
      setSubmitError((err as Error).message);
      setSubmitting(false);
    }
  }

  /* ---------- Render helpers ---------- */

  const calendarCells = useMemo(() => {
    const first = new Date(Date.UTC(month.y, month.m - 1, 1));
    const offset = (first.getUTCDay() + 6) % 7; // Monday-first
    const n = daysInMonth(month.y, month.m);
    const cells: (string | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= n; d++) cells.push(ymd(month.y, month.m, d));
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [month]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <ol className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <StepHeader n={1} label="Session type" active={step === 1} done={step > 1} />
          <StepHeader n={2} label="Date and time" active={step === 2} done={step > 2} />
          <StepHeader n={3} label="Your details" active={step === 3} done={false} />
        </ol>

        {cancelled && step !== 3 && (
          <p className="mb-6 rounded-2xl border border-clay-300 bg-clay-100 px-4 py-3 text-sm text-clay-700">
            Payment was cancelled, so nothing was booked. Pick a time to try again.
          </p>
        )}

        {step === 1 && (
          <section aria-labelledby="step1">
            <h2 id="step1" ref={headingRef} tabIndex={-1} className="font-display text-2xl text-pine-900 outline-none">What would you like to book?</h2>
            <ul className="mt-5 border-t border-cream-200">
              {services.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => chooseService(s.id)}
                    className="focus-ring group grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 border-b border-cream-200 py-5 text-left hover:bg-cream-100"
                  >
                    <span className="font-display text-lg text-pine-700 underline-offset-4 group-hover:underline">{s.name}</span>
                    <span className="shrink-0 font-display text-xl tabular-nums text-ink">{formatPrice(s.pricePence)}</span>
                    <span className="col-start-1 text-sm text-ink-soft">{s.tagline}</span>
                    <span className="col-start-1 text-[length:var(--text-meta)] text-muted">{s.durationMinutes} minutes · one-to-one</span>
                  </button>
                </li>
              ))}
              <li>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 border-b border-cream-200 py-5">
                  <span className="font-display text-lg text-pine-700">Not what you&rsquo;re looking for?</span>
                  <span className="shrink-0 font-display text-xl text-ink">Ask</span>
                  <span className="col-start-1 text-sm text-ink-soft">
                    Preethi is flexible. Bulk sessions ({blockDiscountPercent}% off), a regular weekly slot, a different subject or length, in-person in
                    Norwich: get in touch directly and she will arrange it around you.
                  </span>
                  <span className="col-start-1 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    <a href={`mailto:${contactEmail}`} className="focus-ring inline-flex items-center gap-1.5 rounded-sm font-medium text-pine-800 underline-offset-4 hover:underline">
                      <Icon.Mail width={15} height={15} className="shrink-0 text-pine-600" aria-hidden />
                      <span className="break-all">{contactEmail}</span>
                    </a>
                    {phone && phoneE164 && (
                      <a href={`tel:${phoneE164}`} className="focus-ring inline-flex items-center gap-1.5 rounded-sm font-medium text-pine-800 underline-offset-4 hover:underline">
                        <Icon.Phone width={15} height={15} className="shrink-0 text-pine-600" aria-hidden />
                        {phone}
                      </a>
                    )}
                  </span>
                </div>
              </li>
            </ul>
          </section>
        )}

        {step === 2 && service && (
          <section aria-labelledby="step2">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="step2" ref={headingRef} tabIndex={-1} className="font-display text-2xl text-pine-900 outline-none">Choose a date and time</h2>
              <button type="button" onClick={() => setStep(1)} className="focus-ring rounded-sm text-sm font-medium text-pine-700 underline underline-offset-4">
                Change session type
              </button>
            </div>
            <p className="mt-2 text-sm text-muted">
              Times are shown in UK time ({timezone}).{showViewerTz && ` Your device is on ${viewerTz}, so your local time is shown next to each slot.`}
            </p>
            {submitError && (
              <p role="alert" className="mt-4 rounded-xl border border-danger/30 bg-danger-surface px-4 py-3 text-sm text-danger">
                {submitError}
              </p>
            )}

            <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="panel p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => shiftMonth(-1)} disabled={!canGoPrev} aria-label="Previous month" className="btn btn-secondary !px-3 !py-2">
                    ‹
                  </button>
                  <p className="font-display text-lg text-pine-900" aria-live="polite">
                    {MONTHS[month.m - 1]} {month.y}
                  </p>
                  <button type="button" onClick={() => shiftMonth(1)} disabled={!canGoNext} aria-label="Next month" className="btn btn-secondary !px-3 !py-2">
                    ›
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
                  {WEEKDAYS.map((w) => (
                    <span key={w} className="py-1">
                      {w}
                    </span>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1" aria-label={`Days in ${MONTHS[month.m - 1]} ${month.y}`}>
                  {calendarCells.map((key, i) => {
                    if (!key) return <span key={`e${i}`} />;
                    const has = Boolean(slots?.[key]?.length);
                    const selected = key === selectedDay;
                    const isToday = key === ymd(today.y, today.m, today.d);
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={selected}
                        aria-label={`${fmtDayHeading(key)}${has ? `, ${slots?.[key]?.length} times available` : ", no times available"}`}
                        disabled={!has || loading}
                        onClick={() => {
                          setSelectedDay(key);
                          setSelectedSlot(null);
                        }}
                        className={`focus-ring relative aspect-square rounded-xl text-sm transition ${
                          selected
                            ? "bg-pine-700 font-semibold text-white"
                            : has
                              ? "bg-pine-50 font-medium text-pine-900 hover:bg-pine-100"
                              : "text-muted-strong disabled:cursor-not-allowed"
                        } ${isToday && !selected ? "ring-2 ring-clay-700" : ""}`}
                      >
                        {Number(key.slice(-2))}
                        {has && !selected && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-pine-500" aria-hidden />}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 min-h-5 text-xs text-muted" aria-live="polite">
                  {loading ? "Checking the calendar…" : loadError ? <span className="text-danger">{loadError}</span> : slots && !Object.keys(slots).length ? "No free times this month." : source === "calendar" ? "Live availability from Preethi's calendar." : ""}
                </p>
                {loadError && (
                  <button type="button" onClick={() => setLoadError(null)} className="btn btn-secondary mt-2 !py-2 text-sm">
                    Try again
                  </button>
                )}
              </div>

              <div className="panel p-4 sm:p-5">
                {!selectedDay ? (
                  <p className="text-sm text-muted">Pick a highlighted day to see times.</p>
                ) : (
                  <>
                    <p className="font-display text-lg text-pine-900">{fmtDayHeading(selectedDay)}</p>
                    <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
                      {(slots?.[selectedDay] ?? []).map((iso) => {
                        const sel = iso === selectedSlot;
                        return (
                          <li key={iso}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSlot(iso);
                                setSubmitError(null);
                              }}
                              aria-pressed={sel}
                              className={`focus-ring w-full rounded-xl border px-2 py-2 text-sm font-medium transition ${
                                sel ? "border-pine-700 bg-pine-700 text-white" : "border-line bg-white text-pine-900 hover:border-pine-700"
                              }`}
                            >
                              {fmtTime(iso, timezone)}
                              {showViewerTz && viewerTz && <span className={`block text-[0.65rem] ${sel ? "text-pine-100" : "text-muted"}`}>{fmtLocalSlot(iso, viewerTz, timezone)}</span>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <button type="button" disabled={!selectedSlot} onClick={() => setStep(3)} className="btn btn-primary mt-5 w-full">
                      Continue <Icon.Arrow width={16} height={16} aria-hidden />
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {step === 3 && service && selectedSlot && (
          <section aria-labelledby="step3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="step3" ref={headingRef} tabIndex={-1} className="font-display text-2xl text-pine-900 outline-none">Your details</h2>
              <button type="button" onClick={() => setStep(2)} className="focus-ring rounded-sm text-sm font-medium text-pine-700 underline underline-offset-4">
                Change time
              </button>
            </div>
            <form onSubmit={submit} noValidate className="mt-5 grid gap-5 border-t border-cream-200 pt-6">
              <p className="text-xs text-muted">
                Fields marked <span aria-hidden className="text-danger">*</span>
                <span className="sr-only">with an asterisk</span> are required.
              </p>
              <div className="grid items-start gap-5 sm:grid-cols-2">
                <Field id="field-name" label="Student's name" required error={fieldErrors.name}>
                  <input id="field-name" className="field" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={Boolean(fieldErrors.name)} aria-describedby="field-name-desc" required />
                </Field>
                <Field id="field-email" label="Email for the invitation" required error={fieldErrors.email} hint="The Google Meet link goes here.">
                  <input id="field-email" className="field" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={Boolean(fieldErrors.email)} aria-describedby="field-email-desc" required />
                </Field>
                <Field id="field-parentName" label="Parent or guardian's name" hint="Please add this if the student is under 18, and use an email address a parent can see.">
                  <input id="field-parentName" className="field" autoComplete="off" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} aria-describedby="field-parentName-desc" />
                </Field>
                <Field id="field-yearGroup" label="Year group or stage">
                  <select id="field-yearGroup" className="field" value={form.yearGroup} onChange={(e) => setForm({ ...form, yearGroup: e.target.value })}>
                    <option value="">Choose…</option>
                    {["Year 9", "Year 10", "Year 11", "Year 12", "Year 13", "Gap year", "Other"].map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field id="field-notes" label="Anything Preethi should know?" hint="Exam board, topics you are stuck on, target grade, upcoming deadlines. Say if you would prefer to meet in person in Norwich.">
                <textarea id="field-notes" className="field min-h-24" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={800} aria-describedby="field-notes-desc" />
              </Field>
              <div className="hidden" aria-hidden>
                <label>
                  Website <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                </label>
              </div>
              <label className="flex items-start gap-3 text-sm text-ink-soft">
                <input id="field-agree" type="checkbox" className="focus-ring mt-1 h-4 w-4 accent-pine-700" checked={form.agree} aria-invalid={Boolean(fieldErrors.agree)} onChange={(e) => setForm({ ...form, agree: e.target.checked })} />
                <span>
                  I agree to the{" "}
                  <a href="/terms" target="_blank" rel="noreferrer" className="focus-ring rounded-sm font-medium text-pine-800 underline underline-offset-4">
                    terms and cancellation policy<span className="sr-only"> (opens in a new tab)</span>
                  </a>{" "}
                  ({cancellationNoticeHours} hours&rsquo; notice to reschedule) and have read the{" "}
                  <a href="/privacy" target="_blank" rel="noreferrer" className="focus-ring rounded-sm font-medium text-pine-800 underline underline-offset-4">
                    privacy notice<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  .
                </span>
              </label>
              {fieldErrors.agree && <p role="alert" className="-mt-3 text-sm text-danger">{fieldErrors.agree}</p>}
              {submitError && (
                <p role="alert" className="rounded-xl border border-danger/30 bg-danger-surface px-4 py-3 text-sm text-danger">
                  {submitError}
                </p>
              )}
              <button type="submit" disabled={submitting} className="btn btn-primary w-full sm:w-auto sm:justify-self-end">
                {submitting ? "One moment…" : service.pricePence === 0 ? "Confirm free call" : `Pay ${formatPrice(service.pricePence)} and book`}
                {!submitting && <Icon.Arrow width={16} height={16} aria-hidden />}
              </button>
              <p className="text-xs text-muted">
                {service.pricePence === 0
                  ? "You will get a calendar invitation with a Google Meet link straight away."
                  : "You will be taken to the card payment page next."}{" "}
                Problems? Email <a href={`mailto:${contactEmail}`} className="underline underline-offset-4">{contactEmail}</a>.
              </p>
            </form>
          </section>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="panel p-5">
          <p className="font-medium text-ink">Your booking</p>
          {service ? (
            <>
              <p className="mt-2 font-display text-xl text-pine-900">{service.name}</p>
              <p className="text-sm text-muted">{service.durationMinutes} minutes · online via Google Meet, or in person in Norwich</p>
              <dl className="mt-4 space-y-2 border-t border-cream-200 pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">When</dt>
                  <dd className="text-right font-medium text-ink">{selectedSlot ? fmtLong(selectedSlot, timezone) : "Not chosen yet"}</dd>
                </div>
                {selectedSlot && showViewerTz && viewerTz && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Your local time</dt>
                    <dd className="text-right text-ink">{fmtLong(selectedSlot, viewerTz)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Price</dt>
                  <dd className="font-semibold text-pine-800">{formatPrice(service.pricePence)}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">Choose a session type to get started.</p>
          )}
          <ul className="mt-5 space-y-2 border-t border-cream-200 pt-4 text-xs text-muted">
            <li className="flex gap-2"><Icon.Calendar width={14} height={14} className="mt-0.5 shrink-0 text-pine-600" aria-hidden /> Calendar invite with Meet link sent automatically</li>
            <li className="flex gap-2"><Icon.Clock width={14} height={14} className="mt-0.5 shrink-0 text-pine-600" aria-hidden /> Reschedule free with {cancellationNoticeHours} hours&rsquo; notice</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function StepHeader({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <li className={`flex items-center gap-2 text-sm ${active ? "text-pine-900 font-semibold" : "text-muted"}`}>
      <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${done ? "bg-pine-600 text-white" : active ? "bg-pine-100 text-pine-800" : "bg-cream-200 text-ink-soft"}`}>
        {done ? <Icon.Check width={14} height={14} aria-hidden /> : n}
      </span>
      {label}
    </li>
  );
}

/**
 * Label, control, and a description slot (`<id>-desc`) holding the error and hint, so the control can
 * point at it with aria-describedby and a screen reader hears the error when focus lands on the field.
 */
function Field({ id, label, hint, error, required, children }: { id: string; label: string; hint?: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium leading-snug text-ink">
        {label}
        {required && (
          <>
            <span aria-hidden className="text-danger"> *</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      <span className="mt-1.5 block">{children}</span>
      <span id={`${id}-desc`}>
        {error && <span role="alert" className="mt-1.5 block text-sm text-danger">{error}</span>}
        {hint && <span className="mt-1.5 block text-xs leading-snug text-muted">{hint}</span>}
      </span>
    </div>
  );
}
