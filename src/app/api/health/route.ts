import { NextRequest, NextResponse } from "next/server";
import { TIMEZONE } from "@/lib/config";
import { isEmailConfigured } from "@/lib/email";
import { calendarHealth, isGoogleConfigured } from "@/lib/google";
import { isLiveMode, isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/** The calendar check is public, so its result is reused for a minute to stop anyone burning the Calendar API quota. */
const CALENDAR_CACHE_MS = 60_000;
let calendarCache: { at: number; result: Awaited<ReturnType<typeof calendarHealth>> } | null = null;
async function cachedCalendarHealth() {
  if (!calendarCache || Date.now() - calendarCache.at > CALENDAR_CACHE_MS) {
    calendarCache = { at: Date.now(), result: await calendarHealth() };
  }
  return calendarCache.result;
}

/** Public, secret-free status endpoint. `?deep=1` also checks Google Calendar (at most once a minute per instance). */
export async function GET(req: NextRequest) {
  const deep = req.nextUrl.searchParams.get("deep") === "1";
  const stripeOk = isStripeConfigured();
  const webhookOk = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  const googleOk = isGoogleConfigured();
  const calendar = deep && googleOk ? await cachedCalendarHealth() : undefined;
  const ok = stripeOk && webhookOk && googleOk && (calendar ? calendar.ok : true);
  return NextResponse.json(
    {
      ok,
      now: new Date().toISOString(),
      timezone: TIMEZONE,
      stripe: { configured: stripeOk, mode: stripeOk ? (isLiveMode() ? "live" : "test") : null, webhookSecret: webhookOk },
      google: { configured: googleOk, calendar },
      email: { configured: isEmailConfigured() },
    },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
