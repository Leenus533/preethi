import type { Metadata } from "next";
import { SITE } from "@/lib/config";
import { LegalPage } from "@/components/LegalPage";
import { pageSocial } from "@/lib/seo";

const description = `How ${SITE.name} collects and uses booking details, who they are shared with (Stripe, Google, Resend and Cloudflare), how long they are kept and your rights.`;

export const metadata: Metadata = {
  title: "Privacy notice",
  description,
  alternates: { canonical: "/privacy" },
  ...pageSocial("/privacy", `Privacy notice | ${SITE.name}`, description),
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy notice" updated="3 September 2026">
      <section>
        <h2>What we collect</h2>
        <p>
          When you book we ask for the student&rsquo;s name, an email address, optionally a parent or guardian&rsquo;s name and year group, and any notes you choose
          to add. Payment card details are entered on Stripe&rsquo;s secure checkout and are never seen or stored by this site. Like most websites, our hosting
          provider records your IP address in server logs for security and to prevent abuse.
        </p>
      </section>
      <section>
        <h2>How it is used</h2>
        <p>
          We process this information because it is necessary to provide the tutoring you book, or to take the steps you ask for before booking. Server logs
          are kept under our legitimate interest in keeping the site secure.
        </p>
        <ul>
          <li>To create the booking in Preethi&rsquo;s Google Calendar and send you a calendar invitation with the Google Meet link.</li>
          <li>To take payment through Stripe and issue a receipt.</li>
          <li>To email you a booking confirmation, and to email Preethi the booking details, through Resend, our email delivery provider.</li>
          <li>To prepare for and deliver your sessions, and to contact you about them.</li>
        </ul>
      </section>
      <section>
        <h2>Who it is shared with</h2>
        <p>
          Stripe (payments) receives your name, email address, the session date and price, any notes you add and, where given, the parent or guardian&rsquo;s
          name and year group, so that the payment and receipt match your booking. Google (calendar and video calls) receives the same details to create the
          calendar event and invitation. Resend (email delivery) sends the booking confirmation and notification emails and keeps their content and delivery
          logs for up to 30 days. Cloudflare provides our domain&rsquo;s DNS and forwards email sent to bookings@preethi.co.uk to
          Preethi&rsquo;s inbox. Each of these providers processes your details under its own privacy policy. This site is hosted on Vercel, whose servers
          record your IP address in security logs. Your information is not sold or used for advertising.
        </p>
      </section>
      <section>
        <h2>How long it is kept</h2>
        <p>
          Booking details stay in Preethi&rsquo;s calendar and Stripe account for as long as needed for tax and record-keeping purposes, normally six years for payment
          records. Email content and delivery logs are kept by Resend for up to 30 days. You can ask for your details to be deleted at any time.
        </p>
      </section>
      <section>
        <h2>Your rights and contact</h2>
        <p>
          You can ask to see, correct or delete the information held about you by emailing <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. You
          also have the right to complain to the Information Commissioner&rsquo;s Office (ico.org.uk).
        </p>
      </section>
      <section>
        <h2>Cookies</h2>
        <p>This site sets no tracking cookies. Stripe may set cookies on its own checkout page for fraud prevention.</p>
      </section>
    </LegalPage>
  );
}
