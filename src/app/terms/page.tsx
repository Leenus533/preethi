import type { Metadata } from "next";
import { SITE } from "@/lib/config";

export const metadata: Metadata = { title: "Terms and cancellation policy" };

export default function TermsPage() {
  const h = SITE.cancellationNoticeHours;
  return (
    <div className="container-x py-12 sm:py-16">
      <article className="prose-custom mx-auto max-w-2xl">
        <p className="eyebrow">Terms</p>
        <h1 className="font-display mt-2 text-3xl text-pine-900 sm:text-4xl">Terms and cancellation policy</h1>
        <p className="mt-3 text-sm text-muted">Last updated 2 September 2026</p>

        <div className="mt-8 space-y-6 text-ink-soft leading-relaxed">
          <section>
            <h2 className="font-display text-xl text-pine-900">1. Who you are booking with</h2>
            <p className="mt-2">
              Sessions are provided by {SITE.tutorName}, trading as a self-employed sole trader based in {SITE.location}, United Kingdom. Contact:{" "}
              <a href={`mailto:${SITE.contactEmail}`} className="text-pine-800 underline underline-offset-4">{SITE.contactEmail}</a>. A postal address
              is available on request for any formal correspondence.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-pine-900">2. Booking and payment</h2>
            <p className="mt-2">
              A session is confirmed when payment is completed through Stripe and a calendar invitation has been sent. Prices are shown in pounds sterling and
              include everything; there are no extra fees. Free introductory calls are confirmed on booking.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-pine-900">3. Rescheduling and cancellation</h2>
            <p className="mt-2">
              You may reschedule or cancel any session free of charge with at least {h} hours&rsquo; notice by replying to your booking email. With less than {h}{" "}
              hours&rsquo; notice the session fee is normally not refundable, except in genuine emergencies at Preethi&rsquo;s discretion, and subject to your
              statutory rights in section 4. If Preethi has to cancel, you will be offered a new time or a full refund.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-pine-900">4. Your right to cancel and refunds</h2>
            <p className="mt-2">
              Because you book online, the Consumer Contracts Regulations 2013 give you the right to cancel within 14 days of booking for any reason. If you
              cancel within those 14 days and the session has not yet taken place, you receive a full refund even if less than {h} hours&rsquo; notice was
              given. By booking a session that falls inside the 14-day period you ask for the service to be provided within that period; once the session
              has taken place the right to cancel it no longer applies.
            </p>
            <p className="mt-2">
              Refunds are returned to the original payment card and usually appear within 5 to 10 working days. Nothing in these terms affects your
              statutory rights.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-pine-900">5. Sessions</h2>
            <p className="mt-2">
              Sessions run online over Google Meet at the booked time and last for the booked duration. If a student arrives late the session still ends at the
              scheduled time. If nobody joins within 15 minutes the session is treated as a late cancellation.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-pine-900">6. Safeguarding</h2>
            <p className="mt-2">
              Preethi holds an Enhanced DBS check through UEA Medical School. For students under 18, a parent or guardian must agree to the booking: add
              their name at booking and use an email address a parent can see. Parents are welcome to be present during sessions. Sessions are not recorded
              without agreement from everyone involved.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-pine-900">7. Results</h2>
            <p className="mt-2">Tutoring supports learning but no particular grade or admissions outcome can be guaranteed.</p>
          </section>
          <section>
            <h2 className="font-display text-xl text-pine-900">8. Complaints and governing law</h2>
            <p className="mt-2">
              If something goes wrong, email{" "}
              <a href={`mailto:${SITE.contactEmail}`} className="text-pine-800 underline underline-offset-4">{SITE.contactEmail}</a> and Preethi will reply within
              five working days. These terms are governed by the law of England and Wales.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
