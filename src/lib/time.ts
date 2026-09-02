/**
 * Small, dependency-free timezone helpers built on Intl.
 * All "zoned" values are wall-clock times in a named IANA timezone.
 */

export type Ymd = { y: number; m: number; d: number }; // m is 1-12

const partsCache = new Map<string, Intl.DateTimeFormat>();

function formatter(tz: string): Intl.DateTimeFormat {
  let f = partsCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    partsCache.set(tz, f);
  }
  return f;
}

/** Wall-clock parts of an instant in the given timezone. */
export function toZoned(ts: number | Date, tz: string) {
  const date = typeof ts === "number" ? new Date(ts) : ts;
  const parts = formatter(tz).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const y = get("year");
  const m = get("month");
  const d = get("day");
  const h = get("hour") === 24 ? 0 : get("hour");
  const mi = get("minute");
  const s = get("second");
  return { y, m, d, h, mi, s, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

/** Offset of `tz` from UTC at the given instant, in milliseconds (positive east of UTC). */
export function tzOffsetMs(ts: number, tz: string): number {
  const z = toZoned(ts, tz);
  const asUtc = Date.UTC(z.y, z.m - 1, z.d, z.h, z.mi, z.s);
  // Drop sub-second part of ts so the comparison is exact.
  return asUtc - Math.floor(ts / 1000) * 1000;
}

/**
 * Convert a wall-clock time in `tz` to an instant.
 * Handles DST transitions: for a non-existent local time (spring forward) the
 * result moves forward by the gap; for an ambiguous time (fall back) the first
 * occurrence is used.
 */
export function zonedToUtc(y: number, m: number, d: number, h: number, mi: number, tz: string): Date {
  const guess = Date.UTC(y, m - 1, d, h, mi);
  // Candidate offsets: the ones in force a day before and a day after (covers any single transition).
  const offsets = [...new Set([tzOffsetMs(guess - 86_400_000, tz), tzOffsetMs(guess, tz), tzOffsetMs(guess + 86_400_000, tz)])];
  const valid = offsets
    .map((off) => guess - off)
    .filter((t) => {
      const z = toZoned(t, tz);
      return z.y === y && z.m === m && z.d === d && z.h === h && z.mi === mi;
    })
    .sort((a, b) => a - b);
  if (valid.length) return new Date(valid[0]); // ambiguous time: first occurrence
  // Non-existent time (spring-forward gap): shift forward by the gap using the pre-transition offset.
  return new Date(guess - tzOffsetMs(guess - 86_400_000, tz));
}

export function parseYmd(s: string): Ymd | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const check = new Date(Date.UTC(y, mo - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null;
  return { y, m: mo, d };
}

export function ymdToString({ y, m, d }: Ymd): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function addDays({ y, m, d }: Ymd, n: number): Ymd {
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export function diffDays(a: Ymd, b: Ymd): number {
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000);
}

/** Calendar date (in tz) of an instant. */
export function ymdOf(ts: number | Date, tz: string): Ymd {
  const z = toZoned(ts, tz);
  return { y: z.y, m: z.m, d: z.d };
}

export function parseHm(s: string): { h: number; mi: number } {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) throw new Error(`Bad time "${s}", expected HH:MM`);
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) throw new Error(`Bad time "${s}", hours must be 00-23 and minutes 00-59`);
  return { h, mi };
}

export function formatDateTime(ts: number | Date, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(typeof ts === "number" ? new Date(ts) : ts);
}

export function formatDate(ts: number | Date, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(typeof ts === "number" ? new Date(ts) : ts);
}

export function formatTime(ts: number | Date, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(typeof ts === "number" ? new Date(ts) : ts);
}

/** Short timezone label such as "BST" or "GMT" for an instant. */
export function tzAbbreviation(ts: number | Date, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, timeZoneName: "short" }).formatToParts(
    typeof ts === "number" ? new Date(ts) : ts,
  );
  return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
}
