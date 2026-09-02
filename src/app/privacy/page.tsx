import type { Metadata } from "next";
import { SITE } from "@/lib/config";

export const metadata: Metadata = { title: "Privacy notice" };

export default function PrivacyPage() {
  return (
    <div className="container-x py-12 sm:py-16">
      <article className="mx-auto max-w-[var(--measure)]">
        <h1 className="font-display font-display-lg text-[length:var(--text-h2)] leading-[1.12] text-pine-900">Privacy notice</h1>
        <p className="mt-3 text-sm text-muted">Last updated 2 September 2026</p>

        <div className="mt-8 space-y-6 text-ink-soft leading-relaxed">
          <section>
            <h2 className="font-display text-[length:var(--text-h3)] text-pine-900">What we collect</h2>
            <p className="mt-2">
              When you book we ask for the student&rsquo;s name, an email address, optionally a parent or guardian&rsquo;s name and year group, and any notes you choose
              to add. Payment card details are entered on Stripe&rsquo;s secure checkout and are never seen or stored by this site. Like most websites, our hosting
              provider records your IP address in server logs for security and to prevent abuse.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[length:var(--text-h3)] text-pine-900">How it is used</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>To create the booking in Preethi&rsquo;s Google Calendar and send you a calendar invitation with the Google Meet link.</li>
              <li>To take payment through Stripe and issue a receipt.</li>
              <li>To prepare for and deliver your sessions, and to contact you about them.</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-[length:var(--text-h3)] text-pine-900">Who it is shared with</h2>
            <p className="mt-2">
              Stripe (payments) receives your name, email address and a short description of the session, including any notes you add at booking, so that the
              payment and receipt match your booking. Google (calendar and video calls) receives the same details to create the calendar event and invitation.
              Both process your details under their own privacy policies. This site is hosted on Vercel. Your information is not sold or used for advertising.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[length:var(--text-h3)] text-pine-900">How long it is kept</h2>
            <p className="mt-2">
              Booking details stay in Preethi&rsquo;s calendar and Stripe account for as long as needed for tax and record-keeping purposes, normally six years for
              payment records. You can ask for your details to be deleted at any time.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[length:var(--text-h3)] text-pine-900">Your rights and contact</h2>
            <p className="mt-2">
              You can ask to see, correct or delete the information held about you by emailing{" "}
              <a href={`mailto:${SITE.contactEmail}`} className="text-pine-800 underline underline-offset-4">{SITE.contactEmail}</a>. You also have the right to complain
              to the Information Commissioner&rsquo;s Office (ico.org.uk).
            </p>
          </section>
          <section>
            <h2 className="font-display text-[length:var(--text-h3)] text-pine-900">Cookies</h2>
            <p className="mt-2">This site sets no tracking cookies. Stripe may set cookies on its own checkout page for fraud prevention.</p>
          </section>
        </div>
      </article>
    </div>
  );
}
