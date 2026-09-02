import { test } from "node:test";
import assert from "node:assert/strict";
import { zonedToUtc, toZoned, tzOffsetMs, ymdOf, addDays, diffDays, parseYmd, formatTime } from "../src/lib/time";

const TZ = "Europe/London";

test("London wall clock converts correctly in summer (BST, UTC+1)", () => {
  const d = zonedToUtc(2026, 7, 15, 17, 0, TZ);
  assert.equal(d.toISOString(), "2026-07-15T16:00:00.000Z");
});

test("London wall clock converts correctly in winter (GMT, UTC+0)", () => {
  const d = zonedToUtc(2026, 1, 15, 17, 0, TZ);
  assert.equal(d.toISOString(), "2026-01-15T17:00:00.000Z");
});

test("spring-forward gap (01:30 on 29 Mar 2026 does not exist) moves forward", () => {
  // Clocks go 01:00 -> 02:00 UTC on the last Sunday in March.
  const d = zonedToUtc(2026, 3, 29, 1, 30, TZ);
  const z = toZoned(d, TZ);
  assert.equal(z.d, 29);
  assert.ok(z.h >= 2, `expected hour >= 2, got ${z.h}:${z.mi}`);
});

test("fall-back ambiguity (01:30 on 25 Oct 2026 happens twice) picks the first occurrence", () => {
  const d = zonedToUtc(2026, 10, 25, 1, 30, TZ);
  // First occurrence is BST: 01:30 BST = 00:30 UTC.
  assert.equal(d.toISOString(), "2026-10-25T00:30:00.000Z");
});

test("day windows around the DST change have the right length", () => {
  // 09:00-17:00 on the spring-forward day is still 8 wall-clock hours.
  const s = zonedToUtc(2026, 3, 29, 9, 0, TZ).getTime();
  const e = zonedToUtc(2026, 3, 29, 17, 0, TZ).getTime();
  assert.equal((e - s) / 3_600_000, 8);
});

test("tzOffsetMs reflects BST and GMT", () => {
  assert.equal(tzOffsetMs(Date.UTC(2026, 6, 1, 12), TZ), 3_600_000);
  assert.equal(tzOffsetMs(Date.UTC(2026, 0, 1, 12), TZ), 0);
});

test("ymdOf uses the local date, not the UTC date", () => {
  // 23:30 UTC on 1 July is 00:30 BST on 2 July.
  assert.deepEqual(ymdOf(Date.UTC(2026, 6, 1, 23, 30), TZ), { y: 2026, m: 7, d: 2 });
});

test("date arithmetic", () => {
  assert.deepEqual(addDays({ y: 2026, m: 2, d: 28 }, 1), { y: 2026, m: 3, d: 1 });
  assert.deepEqual(addDays({ y: 2026, m: 1, d: 1 }, -1), { y: 2025, m: 12, d: 31 });
  assert.equal(diffDays({ y: 2026, m: 1, d: 1 }, { y: 2026, m: 3, d: 1 }), 59);
  assert.equal(parseYmd("2026-02-30"), null);
  assert.equal(parseYmd("2026-2-3"), null);
  assert.deepEqual(parseYmd("2026-02-03"), { y: 2026, m: 2, d: 3 });
});

test("formatTime renders 24h London time", () => {
  assert.equal(formatTime(Date.UTC(2026, 6, 15, 16, 0), TZ), "17:00");
});
