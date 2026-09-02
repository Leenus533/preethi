import { test } from "node:test";
import assert from "node:assert/strict";
import { computeSlots, isSlotOffered, dateRangeToInstants, type AvailabilityConfig } from "../src/lib/availability";
import { zonedToUtc } from "../src/lib/time";

const TZ = "Europe/London";
const cfg: AvailabilityConfig = {
  timezone: TZ,
  weekly: {
    0: [["09:00", "17:00"]],
    1: [["17:00", "21:00"]],
    2: [["17:00", "21:00"]],
    3: [["17:00", "21:00"]],
    4: [["17:00", "21:00"]],
    5: [["17:00", "21:00"]],
    6: [["09:00", "17:00"]],
  },
  slotIntervalMinutes: 30,
  bufferMinutes: 15,
  minNoticeHours: 24,
  maxDaysAhead: 60,
};

// A fixed "now": Monday 7 Sep 2026, 10:00 BST.
const NOW = zonedToUtc(2026, 9, 7, 10, 0, TZ).getTime();
const at = (d: number, h: number, mi = 0) => zonedToUtc(2026, 9, d, h, mi, TZ).getTime();

test("weekday evening window yields 60-minute slots every 30 minutes", () => {
  const slots = computeSlots({ from: { y: 2026, m: 9, d: 9 }, to: { y: 2026, m: 9, d: 9 }, durationMinutes: 60, busy: [], now: NOW, config: cfg });
  const day = slots["2026-09-09"];
  assert.ok(day, "Wednesday should have slots");
  // 17:00 .. 20:00 inclusive = 7 slots
  assert.equal(day.length, 7);
  assert.equal(day[0], new Date(at(9, 17)).toISOString());
  assert.equal(day[day.length - 1], new Date(at(9, 20)).toISOString());
});

test("weekend window is longer", () => {
  const slots = computeSlots({ from: { y: 2026, m: 9, d: 12 }, to: { y: 2026, m: 9, d: 12 }, durationMinutes: 60, busy: [], now: NOW, config: cfg });
  assert.equal(slots["2026-09-12"].length, 15); // 09:00..16:00
});

test("20-minute sessions fit more slots and never run past the window end", () => {
  const slots = computeSlots({ from: { y: 2026, m: 9, d: 9 }, to: { y: 2026, m: 9, d: 9 }, durationMinutes: 20, busy: [], now: NOW, config: cfg });
  const day = slots["2026-09-09"];
  assert.equal(day.length, 8); // 17:00..20:30
  assert.equal(day[day.length - 1], new Date(at(9, 20, 30)).toISOString());
});

test("minimum notice removes slots inside 24 hours", () => {
  // Today (Mon 7th) evening: all slots are within 24h of 10:00 -> none.
  const today = computeSlots({ from: { y: 2026, m: 9, d: 7 }, to: { y: 2026, m: 9, d: 7 }, durationMinutes: 60, busy: [], now: NOW, config: cfg });
  assert.equal(today["2026-09-07"], undefined);
  // Tomorrow (Tue 8th) evening 17:00 is 31h away -> offered.
  const tomorrow = computeSlots({ from: { y: 2026, m: 9, d: 8 }, to: { y: 2026, m: 9, d: 8 }, durationMinutes: 60, busy: [], now: NOW, config: cfg });
  assert.equal(tomorrow["2026-09-08"][0], new Date(at(8, 17)).toISOString());
});

test("busy events block overlapping slots including the buffer", () => {
  // Busy 18:00-19:00 on Wed 9th. With a 15-minute buffer, slots starting 17:00 (ends 18:00, touches buffer) through 19:00 are blocked.
  const busy = [{ start: at(9, 18), end: at(9, 19) }];
  const slots = computeSlots({ from: { y: 2026, m: 9, d: 9 }, to: { y: 2026, m: 9, d: 9 }, durationMinutes: 60, busy, now: NOW, config: cfg });
  const starts = slots["2026-09-09"].map((iso) => new Date(iso).getTime());
  assert.deepEqual(starts, [at(9, 19, 30), at(9, 20)]);
});

test("a busy event exactly matching a slot with zero buffer blocks only that slot", () => {
  const busy = [{ start: at(9, 18), end: at(9, 19) }];
  const slots = computeSlots({ from: { y: 2026, m: 9, d: 9 }, to: { y: 2026, m: 9, d: 9 }, durationMinutes: 60, busy, now: NOW, config: { ...cfg, bufferMinutes: 0 } });
  const starts = slots["2026-09-09"].map((iso) => new Date(iso).getTime());
  assert.deepEqual(starts, [at(9, 17), at(9, 19), at(9, 19, 30), at(9, 20)]);
});

test("all-day busy interval blocks the whole day", () => {
  const busy = [{ start: at(9, 0), end: at(10, 0) }];
  const slots = computeSlots({ from: { y: 2026, m: 9, d: 9 }, to: { y: 2026, m: 9, d: 10 }, durationMinutes: 60, busy, now: NOW, config: cfg });
  assert.equal(slots["2026-09-09"], undefined);
  assert.ok(slots["2026-09-10"]?.length);
});

test("horizon cuts off after maxDaysAhead", () => {
  const slots = computeSlots({ from: { y: 2026, m: 11, d: 1 }, to: { y: 2026, m: 11, d: 30 }, durationMinutes: 60, busy: [], now: NOW, config: cfg });
  const keys = Object.keys(slots).sort();
  assert.equal(keys[keys.length - 1], "2026-11-06"); // 7 Sep + 60 days
});

test("slots across the October clock change keep the right wall-clock times", () => {
  const now = zonedToUtc(2026, 10, 20, 10, 0, TZ).getTime();
  const slots = computeSlots({ from: { y: 2026, m: 10, d: 24 }, to: { y: 2026, m: 10, d: 26 }, durationMinutes: 60, busy: [], now, config: cfg });
  const fmt = (iso: string) => new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
  assert.equal(fmt(slots["2026-10-24"][0]), "09:00"); // Saturday, BST
  assert.equal(fmt(slots["2026-10-25"][0]), "09:00"); // Sunday, GMT after change
  assert.equal(fmt(slots["2026-10-26"][0]), "17:00"); // Monday
  assert.equal(slots["2026-10-25"].length, 15);
});

test("isSlotOffered accepts exact offered instants only", () => {
  const slots = computeSlots({ from: { y: 2026, m: 9, d: 9 }, to: { y: 2026, m: 9, d: 9 }, durationMinutes: 60, busy: [], now: NOW, config: cfg });
  assert.equal(isSlotOffered(slots, new Date(at(9, 17)).toISOString(), TZ), true);
  assert.equal(isSlotOffered(slots, new Date(at(9, 17, 15)).toISOString(), TZ), false);
  assert.equal(isSlotOffered(slots, new Date(at(9, 21)).toISOString(), TZ), false);
  assert.equal(isSlotOffered(slots, "garbage", TZ), false);
});

test("dateRangeToInstants covers local midnight to next local midnight", () => {
  const { timeMin, timeMax } = dateRangeToInstants({ y: 2026, m: 9, d: 9 }, { y: 2026, m: 9, d: 9 }, TZ);
  assert.equal(timeMin.toISOString(), "2026-09-08T23:00:00.000Z");
  assert.equal(timeMax.toISOString(), "2026-09-09T23:00:00.000Z");
});
