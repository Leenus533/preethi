import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import type { BookingDetails, ConfirmedBooking } from "../src/lib/google";
import { studentConfirmationEmail, tutorNotificationEmail, formatShortDateTime } from "../src/lib/email-templates";
import { EmailError, cleanSubject, emailFrom, isEmailConfigured, notifyAddress, sendEmail } from "../src/lib/email";
import { notifyBookingConfirmed } from "../src/lib/notify";

const booking: BookingDetails = {
  bookingRef: "pay_00000000-0000-0000-0000-000000000000",
  serviceId: "alevel-60",
  serviceName: "A-level tutoring",
  start: new Date("2026-10-05T16:00:00.000Z"), // 17:00 BST
  end: new Date("2026-10-05T17:00:00.000Z"),
  studentName: "Tom <b>Bold</b> Example",
  studentEmail: "tom@example.com",
  parentName: "Sam Example",
  yearGroup: "Year 13",
  notes: 'Stuck on integration & "differentiation".\nExam board: AQA',
  pricePence: 3500,
  paymentRef: "pi_123",
};
const ctx = { origin: "https://preethi.co.uk", meetLink: "https://meet.google.com/abc-defg-hij", calendarLink: "https://calendar.google.com/event?eid=1", paymentUrl: "https://dashboard.stripe.com/payments/pi_123" };

test("short date/time for subjects is UK local time", () => {
  assert.equal(formatShortDateTime(booking.start), "Mon 5 Oct, 17:00");
});

test("student confirmation has the essentials and escapes user input", () => {
  const m = studentConfirmationEmail(booking, ctx);
  assert.equal(m.subject, "Booked: A-level tutoring, Mon 5 Oct, 17:00");
  assert.match(m.html, /Hi Tom, thanks for booking/);
  assert.match(m.html, /hello to Sam/);
  assert.match(m.html, /Monday, 5 October 2026/);
  assert.match(m.html, /17:00 to 18:00 BST/);
  assert.match(m.html, /£35\.00 paid/);
  assert.match(m.html, /https:\/\/meet\.google\.com\/abc-defg-hij/);
  assert.match(m.html, /24 hours' notice/);
  assert.match(m.html, /pay_00000000-0000-0000-0000-000000000000/);
  assert.doesNotMatch(m.html, /<b>Bold<\/b>/, "student-typed HTML must be escaped");
  assert.match(m.text, /Session:\s+A-level tutoring/);
  assert.match(m.text, /meet\.google\.com/);
  assert.doesNotMatch(m.text, /<[a-z]+>/, "plain text must not contain tags");
});

test("student confirmation without a Meet link points at the booking page instead", () => {
  const m = studentConfirmationEmail(booking, { origin: "https://preethi.co.uk" });
  assert.match(m.html, /View booking and Meet link/);
  assert.match(m.html, /https:\/\/preethi\.co\.uk\/book\/success\?ref=pay_00000000-0000-0000-0000-000000000000/);
  assert.doesNotMatch(m.html, /Open Google Meet/);
});

test("free intro call reads as free", () => {
  const m = studentConfirmationEmail({ ...booking, pricePence: 0, serviceName: "Introductory call", bookingRef: "free_00000000-0000-0000-0000-000000000000" }, ctx);
  assert.match(m.html, /Your intro call is booked/);
  assert.match(m.html, /No charge/);
  assert.doesNotMatch(m.html, /£/);
  assert.doesNotMatch(m.subject, /free/i, "the word 'free' in a subject invites promotion filtering");
});

test("tutor notification carries student details, notes and links, and flags clashes", () => {
  const m = tutorNotificationEmail(booking, ctx);
  // Subjects are plain text, so the angle brackets stay as typed; only the HTML body is escaped.
  assert.equal(m.subject, "New booking: A-level tutoring with Tom <b>Bold</b> Example, Mon 5 Oct, 17:00");
  assert.match(m.html, /mailto:tom@example\.com/);
  assert.match(m.html, /Sam Example/);
  assert.match(m.html, /Year 13/);
  assert.match(m.html, /Stuck on integration &amp; &quot;differentiation&quot;/);
  assert.match(m.html, /Open in Google Calendar/);
  assert.match(m.html, /dashboard\.stripe\.com\/payments\/pi_123/);
  assert.match(m.html, /Payment reference pi_123/);
  assert.doesNotMatch(m.html, /<b>Bold<\/b>/);
  assert.match(m.text, /Notes from the student:\nStuck on integration & "differentiation"\.\nExam board: AQA/);
  assert.match(m.text, /^Student: Tom <b>Bold<\/b> Example$/m, "plain text uses raw values, not un-escaped HTML");
  assert.match(m.text, /^When: Monday, 5 October 2026, 17:00 to 18:00 BST$/m);

  const clash = tutorNotificationEmail(booking, { ...ctx, clash: true });
  assert.match(clash.subject, /^CLASH: /);
  assert.match(clash.html, /Double booking needs attention/);
  assert.match(clash.text, /DOUBLE BOOKING/);
});

test("emails stay under Gmail's clipping threshold", () => {
  assert.ok(studentConfirmationEmail(booking, ctx).html.length < 102_000);
  assert.ok(tutorNotificationEmail(booking, ctx).html.length < 102_000);
});

/* ---------- Client ---------- */

type Captured = { url: string; init: RequestInit };
let captured: Captured[] = [];
let responder: (n: number) => Response = () => Response.json({ id: "email_1" });
const realFetch = globalThis.fetch;

beforeEach(() => {
  captured = [];
  responder = () => Response.json({ id: "email_1" });
  process.env.RESEND_API_KEY = "re_test";
  delete process.env.EMAIL_FROM;
  delete process.env.NOTIFY_EMAIL;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    captured.push({ url: String(url), init: init ?? {} });
    return responder(captured.length);
  }) as typeof fetch;
});
afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.RESEND_API_KEY;
});

test("configuration helpers", () => {
  assert.equal(isEmailConfigured(), true);
  assert.match(emailFrom(), /<bookings@preethi\.co\.uk>$/);
  assert.equal(notifyAddress(), process.env.CONTACT_EMAIL || "preethinorwich@gmail.com");
  process.env.NOTIFY_EMAIL = "inbox@example.com";
  assert.equal(notifyAddress(), "inbox@example.com");
  delete process.env.RESEND_API_KEY;
  assert.equal(isEmailConfigured(), false);
});

test("sendEmail posts to Resend with the idempotency key, reply-to and sanitised tags", async () => {
  const r = await sendEmail({
    to: "tom@example.com",
    subject: "Hi",
    html: "<p>Hi</p>",
    text: "Hi",
    replyTo: "preethi@example.com",
    idempotencyKey: "booking-confirmation/pay_1",
    tags: { booking: "pay_1", kind: "student value" },
  });
  assert.deepEqual(r, { id: "email_1", deduplicated: false });
  assert.equal(captured.length, 1);
  const { url, init } = captured[0];
  assert.equal(url, "https://api.resend.com/emails");
  const headers = init.headers as Record<string, string>;
  assert.equal(headers.Authorization, "Bearer re_test");
  assert.equal(headers["Idempotency-Key"], "booking-confirmation/pay_1");
  const body = JSON.parse(String(init.body));
  assert.deepEqual(body.to, ["tom@example.com"]);
  assert.equal(body.reply_to, "preethi@example.com");
  assert.match(body.from, /<bookings@preethi\.co\.uk>$/);
  assert.deepEqual(body.tags, [
    { name: "booking", value: "pay_1" },
    { name: "kind", value: "student_value" },
  ]);
});

test("a 409 idempotency conflict counts as already sent", async () => {
  responder = () => Response.json({ message: "Idempotency key already used" }, { status: 409 });
  const r = await sendEmail({ to: "a@example.com", subject: "s", html: "h", text: "t", idempotencyKey: "k" });
  assert.equal(r.deduplicated, true);
});

test("server errors are retried once, client errors are not", async () => {
  responder = (n) => (n === 1 ? Response.json({ message: "boom" }, { status: 500 }) : Response.json({ id: "email_2" }));
  const r = await sendEmail({ to: "a@example.com", subject: "s", html: "h", text: "t", idempotencyKey: "k" });
  assert.equal(r.id, "email_2");
  assert.equal(captured.length, 2);

  captured = [];
  responder = () => Response.json({ message: "bad from" }, { status: 422 });
  await assert.rejects(sendEmail({ to: "a@example.com", subject: "s", html: "h", text: "t", idempotencyKey: "k" }), (e: unknown) => e instanceof EmailError && e.status === 422);
  assert.equal(captured.length, 1);
});

/* ---------- Orchestration ---------- */

const confirmed: ConfirmedBooking = { eventId: "ev1", meetLink: ctx.meetLink, htmlLink: ctx.calendarLink, alreadyExisted: false, clash: false };

test("notifyBookingConfirmed sends both emails with booking-scoped idempotency keys", async () => {
  let n = 0;
  responder = () => Response.json({ id: `email_${++n}` });
  const out = await notifyBookingConfirmed(booking, confirmed, { origin: "https://preethi.co.uk", paymentUrl: ctx.paymentUrl });
  assert.deepEqual(out, { student: "sent", tutor: "sent" });
  const keys = captured.map((c) => (c.init.headers as Record<string, string>)["Idempotency-Key"]).sort();
  assert.deepEqual(keys, ["booking-confirmation/pay_00000000-0000-0000-0000-000000000000", "booking-notification/pay_00000000-0000-0000-0000-000000000000"]);
  const bodies = captured.map((c) => JSON.parse(String(c.init.body)));
  const student = bodies.find((b) => b.to[0] === "tom@example.com");
  const tutor = bodies.find((b) => b.to[0] !== "tom@example.com");
  assert.ok(student && tutor);
  assert.equal(student.reply_to, notifyAddress());
  assert.equal(tutor.reply_to, "tom@example.com");
  assert.equal(tutor.to[0], notifyAddress());
});

test("notifyBookingConfirmed never throws when Resend is down", async () => {
  responder = () => Response.json({ message: "down" }, { status: 503 });
  const out = await notifyBookingConfirmed(booking, confirmed, { origin: "https://preethi.co.uk" });
  assert.deepEqual(out, { student: "failed", tutor: "failed" });
});

test("notifyBookingConfirmed is a no-op without an API key", async () => {
  delete process.env.RESEND_API_KEY;
  const out = await notifyBookingConfirmed(booking, confirmed, { origin: "https://preethi.co.uk" });
  assert.deepEqual(out, { student: "skipped", tutor: "skipped" });
  assert.equal(captured.length, 0);
});

test("a placeholder student name greets with 'there'", () => {
  const m = studentConfirmationEmail({ ...booking, studentName: "Student" }, ctx);
  assert.match(m.html, /Hi there, thanks for booking/);
});

test("control characters never reach a subject line", async () => {
  assert.equal(cleanSubject("New booking: S with Sam\r\nBcc: x@y.z, Mon"), "New booking: S with Sam Bcc: x@y.z, Mon");
  await sendEmail({ to: "a@example.com", subject: "Hi\r\nX-Injected: 1", html: "h", text: "t", idempotencyKey: "k" });
  assert.equal(JSON.parse(String(captured[0].init.body)).subject, "Hi X-Injected: 1");
});

test("a network failure is retried and then surfaces as an EmailError", async () => {
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    captured.push({ url: String(url), init: init ?? {} });
    throw new TypeError("fetch failed");
  }) as typeof fetch;
  await assert.rejects(sendEmail({ to: "a@example.com", subject: "s", html: "h", text: "t", idempotencyKey: "k" }), (e: unknown) => e instanceof EmailError && /unreachable/.test(e.message));
  assert.equal(captured.length, 2);
});

test("notifyBookingConfirmed survives a template error without throwing", async () => {
  const broken = { ...booking, start: new Date("not a date"), end: new Date("not a date") };
  const out = await notifyBookingConfirmed(broken, confirmed, { origin: "https://preethi.co.uk" });
  assert.deepEqual(out, { student: "failed", tutor: "failed" });
  assert.equal(captured.length, 0);
});

test("a booking with no student address still notifies the tutor", async () => {
  const out = await notifyBookingConfirmed({ ...booking, studentEmail: "" }, confirmed, { origin: "https://preethi.co.uk" });
  assert.deepEqual(out, { student: "skipped", tutor: "sent" });
  assert.equal(captured.length, 1);
  const body = JSON.parse(String(captured[0].init.body));
  assert.equal(body.to[0], notifyAddress());
  assert.equal(body.reply_to, undefined);
});
