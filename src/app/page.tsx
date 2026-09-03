import type { Metadata } from "next";
import { About, CtaBand, Faq, HOME_FAQS, Hero, HowItWorks, Pricing, Subjects, TrustStrip } from "@/components/home/Sections";
import { JsonLd } from "@/components/JsonLd";
import { SEO, faqPage, graph, webPage } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Subjects />
      <HowItWorks />
      <About />
      <Pricing />
      <Faq />
      <CtaBand />
      <JsonLd data={graph(webPage("/", SEO.homeTitle, SEO.homeDescription, { faq: true }), faqPage(HOME_FAQS, "/"))} />
    </>
  );
}
