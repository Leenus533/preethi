import type { Metadata } from "next";
import Link from "next/link";
import { SITE, TIMEZONE, getService } from "@/lib/config";
import { findBookingByRef, isGoogleConfigured, meetLinkOf, pricePenceOf, serviceNameOf } from "@/lib/google";
import { isStripeConfigured, stripe } from "@/lib/stripe";
import { formatDate, formatTime, tzAbbreviation } from "@/lib/time";
import { MeetLinkPoller } from "@/components/booking/MeetLinkPoller";
import { Icon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Booking confirmed", robots: { index: false } };
export const dynamic = "force-dynamic";

type Details = { serviceName: string; start: Date; end: Date; email?: string; paid: boolean; amountPence?: number; pending: boolean };

export default async function SuccessPage({ searchParams }: PageProps<"/book/success">) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref : "";
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : "";
  const validRef = /^(free|pay)_[0-9a-f-]{36}$/.test(ref);

  let details: Details | null = null;
  let meetLink: string | undefined;
  let lookupFailed = false;

  if (validRef && sessionId && isStripeConfigured()) {
    try {
      const s = await stripe().checkout.sessions.retrieve(sessionId);
      const md = s.metadata ?? {};
      if (md.bookingRef === ref && md.start && md.end) {
        const paid = s.payment_status === "paid";
        details = {
          serviceName: md.serviceName || getService(md.serviceId)?.name || "Tutoring session",
          start: new Date(md.start),
          end: new Date(md.end),
          email: md.studentEmail || s.customer_details?.email || undefined,
          paid,
          amountPence: s.amount_total ?? 0,
          pending: !paid && s.status === "open",
        };
      }
    } catch (e) {
      console.error("success: stripe lookup failed", e);
      lookupFailed = true;
    }
  }

  if (validRef && isGoogleConfigured()) {
    try {
      const ev = await findBookingByRef(ref);
      if (ev) {
        meetLink = meetLinkOf(ev);
        if (!details && ev.start?.dateTime && ev.end?.dateTime) {
          details = {
            serviceName: serviceNameOf(ev) ?? "Tutoring session",
            start: new Date(ev.start.dateTime),
            end: new Date(ev.end.dateTime),
            paid: true,
            amountPence: pricePenceOf(ev),
            pending: false,
          };
        }
      }
    } catch (e) {
      console.error("success: calendar lookup failed", e);
      lookupFailed = true;
    }
  }

  if (!validRef) {
    return (
      <div className="container-x py-16">
        <h1 className="font-display font-display-lg text-[length:var(--text-h2)] text-pine-900">We could not find that booking</h1>
        <p className="mt-3 text-ink-soft">The link looks incomplete. If you have just paid, check your email for a receipt and calendar invitation, or contact Preethi.</p>
        <Link href="/book" className="btn btn-primary mt-6">Back to booking</Link>
      </div>
    );
  }

  const title = details?.pending ? "Payment is still processing" : "You're booked in";
  const tz = details ? tzAbbreviation(details.start, TIMEZONE) : "";

  return (
    <div className="container-x py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <span
          className={`grid h-14 w-14 place-items-center rounded-full ${details?.pending ? "bg-clay-100 text-clay-700" : "bg-pine-50 text-pine-700"}`}
          aria-hidden
        >
          {details?.pending ? <Icon.Clock width={28} height={28} /> : <Icon.Check width={28} height={28} strokeWidth={2.2} />}
        </span>
        <h1 className="font-display font-display-lg mt-5 text-[length:var(--text-h2)] leading-[1.12] text-pine-900">{title}</h1>

        {details ? (
          <>
            <dl className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
              <div>
                <dt className="text-[length:var(--text-meta)] text-muted">Session</dt>
                <dd className="mt-1 font-medium text-ink">{details.serviceName}</dd>
              </div>
              <div>
                <dt className="text-[length:var(--text-meta)] text-muted">Date</dt>
                <dd className="mt-1 font-medium text-ink">{formatDate(details.start, TIMEZONE)}</dd>
              </div>
              <div>
                <dt className="text-[length:var(--text-meta)] text-muted">Time</dt>
                <dd className="mt-1 font-medium text-ink">
                  {formatTime(details.start, TIMEZONE)} to {formatTime(details.end, TIMEZONE)} {tz}
                </dd>
              </div>
              <div>
                <dt className="text-[length:var(--text-meta)] text-muted">Payment</dt>
                <dd className="mt-1 font-medium text-ink">
                  {details.amountPence === undefined
                    ? ref.startsWith("free_")
                      ? "Free session"
                      : "Paid, see your emailed receipt"
                    : details.amountPence === 0
                      ? "Free session"
                      : `£${(details.amountPence / 100).toFixed(2)} ${details.paid ? "paid" : "pending"}`}
                </dd>
              </div>
            </dl>
            <div className="mt-6">
              <MeetLinkPoller bookingRef={ref} initialMeetLink={meetLink} email={details.email} contactEmail={SITE.contactEmail} />
            </div>
          </>
        ) : (
          <p className="card measure mt-6 p-6 text-ink-soft">
            {lookupFailed
              ? "We could not load the booking details just now, but if your payment went through you will receive a receipt and a calendar invitation by email."
              : "Your booking reference has been recorded. A calendar invitation will follow by email."}
          </p>
        )}

        <div className="measure mt-8 space-y-3 text-sm text-ink-soft">
          <p>
            <strong className="text-ink">What happens next.</strong> A Google Calendar invitation with the Google Meet link is sent to the email address you gave.
            Accept it and it will sit in your own calendar with reminders. A payment receipt is emailed separately.
          </p>
          <p>
            <strong className="text-ink">Need to change the time?</strong> Reply to the invitation or email{" "}
            <a href={`mailto:${SITE.contactEmail}`} className="font-medium text-pine-800 underline underline-offset-4">{SITE.contactEmail}</a> with at least{" "}
            {SITE.cancellationNoticeHours} hours&rsquo; notice.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-secondary">Back to home</Link>
          <Link href="/book" className="btn btn-primary">Book another session</Link>
        </div>
      </div>
    </div>
  );
}
