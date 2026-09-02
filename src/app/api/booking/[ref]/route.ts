import { NextRequest, NextResponse } from "next/server";
import { findBookingByRef, isGoogleConfigured, meetLinkOf, serviceNameOf } from "@/lib/google";

export const dynamic = "force-dynamic";

/** Status check keyed by the unguessable booking reference (only ever shown to the person who booked). Returns no personal data. */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/booking/[ref]">) {
  const { ref } = await ctx.params;
  if (!/^(free|pay)_[0-9a-f-]{36}$/.test(ref)) return NextResponse.json({ error: "Bad reference." }, { status: 400 });
  if (!isGoogleConfigured()) return NextResponse.json({ confirmed: null, meetLink: null });
  try {
    const ev = await findBookingByRef(ref);
    return NextResponse.json(
      { confirmed: Boolean(ev), meetLink: meetLinkOf(ev) ?? null, start: ev?.start?.dateTime ?? null, end: ev?.end?.dateTime ?? null, serviceName: serviceNameOf(ev) ?? null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("booking status failed", e);
    return NextResponse.json({ error: "Temporarily unavailable." }, { status: 503 });
  }
}
