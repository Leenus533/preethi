import { NextRequest, NextResponse } from "next/server";
import { AVAILABILITY, TIMEZONE, getService, serviceMinNoticeHours } from "@/lib/config";
import { computeSlots, dateRangeToInstants, parseDateParam, type Interval } from "@/lib/availability";
import { getBusyIntervals, isGoogleConfigured } from "@/lib/google";
import { diffDays } from "@/lib/time";

export const dynamic = "force-dynamic";

const MAX_SPAN_DAYS = 62;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const service = getService(sp.get("serviceId") ?? "");
  const from = parseDateParam(sp.get("from"));
  const to = parseDateParam(sp.get("to"));

  if (!service) return NextResponse.json({ error: "Unknown service." }, { status: 400 });
  if (!from || !to) return NextResponse.json({ error: "from and to must be YYYY-MM-DD." }, { status: 400 });
  const span = diffDays(from, to);
  if (span < 0 || span > MAX_SPAN_DAYS) {
    return NextResponse.json({ error: `Date range must be 0 to ${MAX_SPAN_DAYS} days.` }, { status: 400 });
  }

  const now = Date.now();
  const { timeMin, timeMax } = dateRangeToInstants(from, to, TIMEZONE);
  let busy: Interval[] = [];
  let source: "calendar" | "hours-only" = "hours-only";

  if (isGoogleConfigured()) {
    try {
      busy = await getBusyIntervals(timeMin, timeMax, now);
      source = "calendar";
    } catch (e) {
      console.error("availability: calendar lookup failed", e);
      return NextResponse.json(
        { error: "Live availability is temporarily unavailable. Please try again in a minute." },
        { status: 503, headers: { "Retry-After": "60" } },
      );
    }
  }

  const minNoticeHours = serviceMinNoticeHours(service);
  const slots = computeSlots({ from, to, durationMinutes: service.durationMinutes, busy, now, minNoticeHours });
  return NextResponse.json(
    {
      timezone: TIMEZONE,
      source,
      serviceId: service.id,
      durationMinutes: service.durationMinutes,
      minNoticeHours,
      maxDaysAhead: AVAILABILITY.maxDaysAhead,
      generatedAt: new Date(now).toISOString(),
      slots,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
