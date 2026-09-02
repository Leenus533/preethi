import { test, before } from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";

const SECRET = "whsec_testsecret";
let POST: (req: Request) => Promise<Response>;

before(async () => {
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  delete process.env.GOOGLE_REFRESH_TOKEN; // calendar not configured: handler must still accept the event
  ({ POST } = (await import("../src/app/api/webhooks/stripe/route")) as unknown as { POST: typeof POST });
});

const stripe = new Stripe("sk_test_dummy");
const payload = JSON.stringify({
  id: "evt_test",
  object: "event",
  type: "checkout.session.completed",
  api_version: "2025-01-01.acacia",
  created: 1,
  livemode: false,
  pending_webhooks: 0,
  request: null,
  data: {
    object: {
      id: "cs_test_1",
      object: "checkout.session",
      payment_status: "paid",
      status: "complete",
      amount_total: 3500,
      payment_intent: "pi_1",
      metadata: {
        bookingRef: "pay_00000000-0000-0000-0000-000000000000",
        serviceId: "alevel-60",
        serviceName: "A-level tutoring",
        start: "2026-10-05T16:00:00.000Z",
        end: "2026-10-05T17:00:00.000Z",
        studentName: "T",
        studentEmail: "t@example.com",
        holdEventId: "",
      },
    },
  },
});

async function call(sig: string, body = payload) {
  const req = new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body,
    headers: { "stripe-signature": sig, "content-type": "application/json" },
  });
  const res = await POST(req);
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

test("a paid session with the calendar unconfigured returns 500 so Stripe retries", async () => {
  const sig = stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });
  const r = await call(sig);
  assert.equal(r.status, 500);
});

test("accepts a correctly signed event that needs no calendar work", async () => {
  const expired = payload.replace("checkout.session.completed", "checkout.session.expired");
  const sig = stripe.webhooks.generateTestHeaderString({ payload: expired, secret: SECRET });
  const r = await call(sig, expired);
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { received: true });
});

test("rejects a wrong secret", async () => {
  const sig = stripe.webhooks.generateTestHeaderString({ payload, secret: "whsec_wrong" });
  assert.equal((await call(sig)).status, 400);
});

test("rejects a tampered payload", async () => {
  const sig = stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });
  assert.equal((await call(sig, payload.replace("3500", "1"))).status, 400);
});

test("rejects a missing signature", async () => {
  assert.equal((await call("")).status, 400);
});

test("ignores unrelated event types", async () => {
  const other = payload.replace("checkout.session.completed", "customer.created");
  const sig = stripe.webhooks.generateTestHeaderString({ payload: other, secret: SECRET });
  assert.equal((await call(sig, other)).status, 200);
});
