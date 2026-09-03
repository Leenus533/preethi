import type { Metadata } from "next";
import { SERVICES, SITE, TIMEZONE } from "@/lib/config";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { JsonLd } from "@/components/JsonLd";
import { graph, webPage } from "@/lib/seo";

const description = "Pick a session, choose a time from Preethi's live calendar and pay online. GCSE, A-level, UCAT and medicine coaching, or a free 20-minute intro call.";

export const metadata: Metadata = {
  title: "Book a tutoring session",
  description,
  alternates: { canonical: "/book" },
  openGraph: { title: `Book a session | ${SITE.name}`, description, url: "/book" },
};

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const sp = await searchParams;
  const service = typeof sp.service === "string" ? sp.service : undefined;
  const cancelled = sp.cancelled === "1";
  const cancelledRef = typeof sp.ref === "string" ? sp.ref : undefined;
  return (
    <div>
      <div className="container-x py-10 sm:py-14">
        <div className="mb-8 max-w-2xl">
          <h1 className="font-display font-display-lg text-[length:var(--text-h2)] leading-[1.12] text-pine-900">Book a session with Preethi</h1>
          <p className="measure mt-3 text-[1.0625rem] text-ink-soft">
            Pick a session type, choose a time that suits you, and pay by card. It takes about two minutes.
          </p>
        </div>
        <BookingWizard
          services={SERVICES}
          timezone={TIMEZONE}
          initialServiceId={service}
          cancelled={cancelled}
          cancelledRef={cancelledRef}
          contactEmail={SITE.contactEmail}
          phone={SITE.showPhone ? SITE.phone : undefined}
          phoneE164={SITE.showPhone ? SITE.phoneE164 : undefined}
          blockDiscountPercent={SITE.blockDiscountPercent}
          cancellationNoticeHours={SITE.cancellationNoticeHours}
        />
      </div>
      <JsonLd data={graph(webPage("/book", `Book a session | ${SITE.name}`, description))} />
    </div>
  );
}
