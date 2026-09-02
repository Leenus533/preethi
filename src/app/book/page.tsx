import type { Metadata } from "next";
import { SERVICES, SITE, TIMEZONE } from "@/lib/config";
import { BookingWizard } from "@/components/booking/BookingWizard";

export const metadata: Metadata = {
  title: "Book a session",
  description: "Choose a session, pick a time from Preethi's live calendar and pay securely online.",
};

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const sp = await searchParams;
  const service = typeof sp.service === "string" ? sp.service : undefined;
  const cancelled = sp.cancelled === "1";
  const cancelledRef = typeof sp.ref === "string" ? sp.ref : undefined;
  return (
    <div className="container-x py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="eyebrow">Booking</p>
        <h1 className="font-display mt-2 text-3xl text-pine-900 sm:text-4xl">Book a session with Preethi</h1>
        <p className="mt-3 text-ink-soft">Pick a session type, choose a time that suits you, and pay by card. It takes about two minutes.</p>
      </div>
      <BookingWizard
        services={SERVICES}
        timezone={TIMEZONE}
        initialServiceId={service}
        cancelled={cancelled}
        cancelledRef={cancelledRef}
        contactEmail={SITE.contactEmail}
        cancellationNoticeHours={SITE.cancellationNoticeHours}
      />
    </div>
  );
}
