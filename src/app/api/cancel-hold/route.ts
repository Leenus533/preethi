import { NextRequest, NextResponse } from "next/server";
import { findHoldByRef, isGoogleConfigured, releaseHold } from "@/lib/google";

export const dynamic = "force-dynamic";

/**
 * Releases the temporary hold when a student backs out of Stripe Checkout.
 * The booking reference is unguessable and a hold is harmless to delete, so no other auth is needed.
 * Stripe's `checkout.session.expired` webhook is the backstop if this is never called.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { ref?: string };
  const ref = typeof body.ref === "string" ? body.ref : "";
  if (!/^pay_[0-9a-f-]{36}$/.test(ref)) return NextResponse.json({ error: "Bad reference." }, { status: 400 });
  if (!isGoogleConfigured()) return NextResponse.json({ released: false });
  try {
    const hold = await findHoldByRef(ref);
    if (hold) await releaseHold(hold.id);
    return NextResponse.json({ released: Boolean(hold) });
  } catch (e) {
    console.error("cancel-hold failed", e);
    return NextResponse.json({ error: "Temporarily unavailable." }, { status: 503 });
  }
}
