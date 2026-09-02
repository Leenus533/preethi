import { test } from "node:test";
import assert from "node:assert/strict";
import { AVAILABILITY, SERVICES, formatPrice } from "../src/lib/config";
import { escapeHtml } from "../src/lib/google";
import { NOTES_MAX, validateBookingInput } from "../src/lib/booking-schema";
import { parseHm } from "../src/lib/time";

test("the calendar hold outlives the Stripe checkout window", () => {
  // Otherwise a student could still be paying after their slot has been released to someone else.
  assert.ok(AVAILABILITY.holdMinutes > AVAILABILITY.checkoutMinutes, "holdMinutes must exceed checkoutMinutes");
  assert.ok(AVAILABILITY.checkoutMinutes >= 30, "Stripe requires at least 30 minutes");
});

test("every service has a sane duration, price and unique id", () => {
  const ids = new Set<string>();
  for (const s of SERVICES) {
    assert.ok(!ids.has(s.id), `duplicate service id ${s.id}`);
    ids.add(s.id);
    assert.ok(s.durationMinutes > 0 && s.durationMinutes <= 180);
    assert.ok(s.pricePence >= 0 && Number.isInteger(s.pricePence));
    assert.ok(s.name.length > 0 && s.highlights.length > 0);
  }
  assert.equal(SERVICES.filter((s) => s.pricePence === 0).length, 1, "exactly one free session type");
});

test("configured weekly windows are valid and non-inverted", () => {
  for (const [day, windows] of Object.entries(AVAILABILITY.weekly)) {
    for (const [from, to] of windows) {
      const a = parseHm(from);
      const b = parseHm(to);
      assert.ok(a.h * 60 + a.mi < b.h * 60 + b.mi, `window ${from}-${to} on day ${day} is inverted`);
    }
  }
});

test("prices render as pounds", () => {
  assert.equal(formatPrice(0), "Free");
  assert.equal(formatPrice(3500), "£35");
  assert.equal(formatPrice(3550), "£35.50");
});

test("HTML in user text is escaped before it reaches a calendar description", () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  assert.equal(escapeHtml("Tom & Jerry"), "Tom &amp; Jerry");
});

test("booking input validation", () => {
  const ok = validateBookingInput({ serviceId: "gcse-60", start: "2026-10-05T16:00:00.000Z", name: "Ada", email: "Ada@Example.COM " });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.value.email, "ada@example.com", "email is normalised");

  const bad = validateBookingInput({ serviceId: "", start: "not-a-date", name: "A", email: "nope" });
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.deepEqual(Object.keys(bad.errors).sort(), ["email", "name", "serviceId", "start"]);

  const spam = validateBookingInput({ serviceId: "gcse-60", start: "2026-10-05T16:00:00.000Z", name: "Ada", email: "a@b.co", website: "http://spam" });
  assert.equal(spam.ok, false);
});

test("notes are capped so they fit inside a Stripe metadata value", () => {
  assert.ok(NOTES_MAX <= 500);
  const long = "x".repeat(2000);
  const r = validateBookingInput({ serviceId: "gcse-60", start: "2026-10-05T16:00:00.000Z", name: "Ada", email: "a@b.co", notes: long });
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value.notes?.length, NOTES_MAX);
});
