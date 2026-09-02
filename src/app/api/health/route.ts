import { NextRequest, NextResponse } from "next/server";
import { TIMEZONE } from "@/lib/config";
import { calendarHealth, isGoogleConfigured } from "@/lib/google";
import { isLiveMode, isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/** Public, secret-free status endpoint. `?deep=1` also makes one round trip to Google Calendar. */
export async function GET(req: NextRequest) {
  const deep = req.nextUrl.searchParams.get("deep") === "1";
  const stripeOk = isStripeConfigured();
  const webhookOk = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  const googleOk = isGoogleConfigured();
  const calendar = deep && googleOk ? await calendarHealth() : undefined;
  const ok = stripeOk && webhookOk && googleOk && (calendar ? calendar.ok : true);
  return NextResponse.json(
    {
      ok,
      now: new Date().toISOString(),
      timezone: TIMEZONE,
      stripe: { configured: stripeOk, mode: stripeOk ? (isLiveMode() ? "live" : "test") : null, webhookSecret: webhookOk },
      google: { configured: googleOk, calendar },
    },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
