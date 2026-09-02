import { About, CtaBand, Faq, Hero, HowItWorks, Pricing, Subjects, TrustStrip } from "@/components/home/Sections";

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
    </>
  );
}
