import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/config";
import { siteOrigin } from "@/lib/site-url";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: `${SITE.name} | GCSE, A-level, UCAT and medical school tutoring`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "One-to-one online tutoring in GCSE and A-level Maths, Biology and Chemistry, UCAT preparation and medical school applications, from a final-year UEA medical student. Book and pay online.",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name}`,
    description: "Science, maths and medicine tutoring from a final-year medical student. Book a free intro call.",
    locale: "en_GB",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${geist.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-pine-700 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
