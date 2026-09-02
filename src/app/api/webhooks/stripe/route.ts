import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getService } from "@/lib/config";
import { confirmBooking, isGoogleConfigured, releaseHold } from "@/lib/google";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, signature, secret);
  } catch (e) {
    console.warn("webhook: bad signature", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.payment_status === "paid") await fulfil(session);
        break;
      }
      case "checkout.session.async_payment_succeeded":
        await fulfil(event.data.object);
        break;
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed":
        await release(event.data.object);
        break;
      default:
        break;
    }
  } catch (e) {
    // Non-2xx makes Stripe retry, which is what we want for transient calendar failures.
    console.error(`webhook: ${event.type} failed`, e);
    return NextResponse.json({ error: "Handler failed, retry later." }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}

async function fulfil(session: Stripe.Checkout.Session) {
  const md = session.metadata ?? {};
  if (!md.bookingRef || !md.start || !md.end) {
    console.warn("webhook: session without booking metadata", session.id);
    return;
  }
  if (!isGoogleConfigured()) {
    // Throwing makes Stripe retry (for up to 3 days), so the booking is written once the calendar is connected.
    throw new Error(`Google Calendar not configured; cannot record paid booking ${md.bookingRef} for ${md.studentEmail} at ${md.start}`);
  }
  const service = getService(md.serviceId);
  const paymentRef = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  const result = await confirmBooking(
    {
      bookingRef: md.bookingRef,
      serviceId: md.serviceId || service?.id || "unknown",
      serviceName: md.serviceName || service?.name || "Tutoring session",
      start: new Date(md.start),
      end: new Date(md.end),
      studentName: md.studentName || session.customer_details?.name || "Student",
      studentEmail: md.studentEmail || session.customer_details?.email || session.customer_email || "",
      parentName: md.parentName || undefined,
      yearGroup: md.yearGroup || undefined,
      notes: md.notes || undefined,
      pricePence: session.amount_total ?? service?.pricePence ?? 0,
      paymentRef: paymentRef ?? session.id,
    },
    md.holdEventId || undefined,
  );
  console.log(`webhook: booking ${md.bookingRef} ${result.alreadyExisted ? "already confirmed" : "confirmed"} as event ${result.eventId}`);
}

async function release(session: Stripe.Checkout.Session) {
  const holdEventId = session.metadata?.holdEventId;
  if (!holdEventId || !isGoogleConfigured()) return;
  await releaseHold(holdEventId);
  console.log(`webhook: released hold ${holdEventId} for ${session.metadata?.bookingRef}`);
}
