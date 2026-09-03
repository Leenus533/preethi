import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { AVAILABILITY, SITE, TIMEZONE, getService } from "@/lib/config";
import { computeSlots, dateRangeToInstants, isSlotOffered, type Interval } from "@/lib/availability";
import { GoogleError, confirmBooking, countActiveHolds, countBookings, createHold, getBusyIntervals, isGoogleConfigured, releaseHold } from "@/lib/google";
import { catalogueProductId, isStripeConfigured, stripe } from "@/lib/stripe";
import { siteOrigin } from "@/lib/site-url";
import { validateBookingInput } from "@/lib/booking-schema";
import { formatDateTime, ymdOf } from "@/lib/time";

export const dynamic = "force-dynamic";

/** Abuse limits. The calendar is the only store, so these are enforced by counting calendar events. */
const MAX_ACTIVE_HOLDS = 6; // slots that can be "in checkout" at once, site-wide
const MAX_INTRO_CALLS_PER_DAY = 3;
const MAX_REQUESTS_PER_IP_PER_HOUR = 10; // best-effort, per serverless instance

const ipHits = new Map<string, number[]>();
function tooManyRequests(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  hits.push(now);
  ipHits.set(ip, hits);
  if (ipHits.size > 5000) ipHits.clear();
  return hits.length > MAX_REQUESTS_PER_IP_PER_HOUR;
}

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null);
  const v = validateBookingInput(raw);
  if (!v.ok) return NextResponse.json({ error: "Please check the highlighted fields.", errors: v.errors }, { status: 400 });
  const input = v.value;

  const service = getService(input.serviceId);
  if (!service) return NextResponse.json({ error: "Unknown session type." }, { status: 400 });

  const isFree = service.pricePence === 0;
  if (!isGoogleConfigured()) {
    // Bookings live in the calendar. Taking money without being able to record the booking would be worse than refusing.
    return NextResponse.json(
      { error: `Online booking is not switched on yet. Please email ${SITE.contactEmail} and Preethi will arrange a time.` },
      { status: 503 },
    );
  }
  if (!isFree && !isStripeConfigured()) {
    return NextResponse.json({ error: `Online payment is not set up yet. Please email ${SITE.contactEmail} to book.` }, { status: 503 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (tooManyRequests(ip)) {
    return NextResponse.json({ error: "Too many booking attempts from this connection. Please try again later." }, { status: 429 });
  }

  // Re-validate the slot server-side against live availability.
  const now = Date.now();
  const startMs = Date.parse(input.start);
  const day = ymdOf(startMs, TIMEZONE);
  const { timeMin, timeMax } = dateRangeToInstants(day, day, TIMEZONE);
  let busy: Interval[] = [];
  try {
    busy = await getBusyIntervals(timeMin, timeMax, now);
  } catch (e) {
    console.error("checkout: calendar lookup failed", e);
    return NextResponse.json({ error: "Live availability is temporarily unavailable. Please try again in a minute." }, { status: 503 });
  }
  const slots = computeSlots({ from: day, to: day, durationMinutes: service.durationMinutes, busy, now });
  if (!isSlotOffered(slots, input.start, TIMEZONE)) {
    return NextResponse.json({ error: "That time is no longer available. Please choose another slot.", code: "slot_taken" }, { status: 409 });
  }

  const start = new Date(startMs);
  const end = new Date(startMs + service.durationMinutes * 60_000);
  const bookingRef = (isFree ? "free_" : "pay_") + randomUUID();
  const origin = siteOrigin(req);

  // Abuse caps that need the calendar.
  try {
    if (isFree) {
      const dayRange = dateRangeToInstants(day, day, TIMEZONE);
      const [sameEmail, sameDay] = await Promise.all([
        countBookings({ serviceId: service.id, studentEmail: input.email, timeMin: new Date(now), timeMax: new Date(now + 90 * 86_400_000) }),
        countBookings({ serviceId: service.id, timeMin: dayRange.timeMin, timeMax: dayRange.timeMax }),
      ]);
      if (sameEmail > 0) {
        return NextResponse.json({ error: "There is already an intro call booked for this email address. Check your inbox for the invitation, or email Preethi to change it." }, { status: 409 });
      }
      if (sameDay >= MAX_INTRO_CALLS_PER_DAY) {
        return NextResponse.json({ error: "All intro-call slots for that day are taken. Please choose another day.", code: "slot_taken" }, { status: 409 });
      }
    }
    if ((await countActiveHolds(now)) >= MAX_ACTIVE_HOLDS) {
      return NextResponse.json({ error: "Several people are booking right now. Please try again in a few minutes." }, { status: 503 });
    }
  } catch (e) {
    console.error("checkout: abuse checks failed", e);
    return NextResponse.json({ error: "Could not reach the calendar. Please try again in a minute." }, { status: 503 });
  }

  // Hold the slot in the calendar while payment is taken.
  let holdEventId: string | undefined;
  try {
    holdEventId = await createHold({ serviceName: service.name, start, end, bookingRef });
  } catch (e) {
    if (e instanceof GoogleError && e.status === 409) {
      return NextResponse.json({ error: e.message, code: "slot_taken" }, { status: 409 });
    }
    console.error("checkout: could not create hold", e);
    return NextResponse.json({ error: "Could not reserve that time. Please try again in a minute." }, { status: 503 });
  }

  if (isFree) {
    try {
      await confirmBooking(
        {
          bookingRef,
          serviceId: service.id,
          serviceName: service.name,
          start,
          end,
          studentName: input.name,
          studentEmail: input.email,
          parentName: input.parentName,
          yearGroup: input.yearGroup,
          notes: input.notes,
          pricePence: 0,
        },
        holdEventId,
      );
    } catch (e) {
      console.error("checkout: free booking failed", e);
      await releaseHold(holdEventId).catch(() => undefined);
      return NextResponse.json({ error: "Could not confirm the booking. Please try again or email Preethi." }, { status: 503 });
    }
    return NextResponse.json({ url: `${origin}/book/success?ref=${bookingRef}` });
  }

  const when = formatDateTime(start, TIMEZONE);
  const metadata: Stripe.MetadataParam = {
    bookingRef,
    serviceId: service.id,
    serviceName: service.name,
    start: start.toISOString(),
    end: end.toISOString(),
    studentName: input.name,
    studentEmail: input.email,
    parentName: input.parentName ?? "",
    yearGroup: input.yearGroup ?? "",
    notes: input.notes ?? "",
    holdEventId,
  };

  try {
    const productId = await catalogueProductId(service.id);
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: input.email,
      client_reference_id: bookingRef,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: service.pricePence,
            ...(productId
              ? { product: productId }
              : {
                  product_data: {
                    name: service.name,
                    description: `${service.durationMinutes}-minute session on ${when} (UK time)`,
                  },
                }),
          },
        },
      ],
      metadata,
      payment_intent_data: {
        description: `${service.name} on ${when}`,
        receipt_email: input.email,
        metadata: { bookingRef, serviceId: service.id, start: start.toISOString(), studentEmail: input.email },
      },
      custom_text: {
        submit: { message: `Paying confirms your ${service.durationMinutes}-minute session on ${when}. Reschedule free with ${SITE.cancellationNoticeHours} hours' notice.` },
      },
      expires_at: Math.floor(Date.now() / 1000) + AVAILABILITY.checkoutMinutes * 60,
      success_url: `${origin}/book/success?ref=${bookingRef}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book?service=${encodeURIComponent(service.id)}&cancelled=1&ref=${bookingRef}`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("checkout: stripe session failed", e);
    await releaseHold(holdEventId).catch(() => undefined);
    return NextResponse.json({ error: "Could not start the payment. Please try again." }, { status: 502 });
  }
}
