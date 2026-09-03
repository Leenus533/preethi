import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/config";
import { siteOrigin } from "@/lib/site-url";
import { SEO, graph, organisation, tutorPerson, website } from "@/lib/seo";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: SEO.homeTitle,
    template: `%s | ${SITE.name}`,
  },
  description: SEO.homeDescription,
  applicationName: SITE.name,
  authors: [{ name: SITE.tutorName, url: siteOrigin() }],
  creator: SITE.tutorName,
  publisher: SITE.name,
  category: "education",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  // No `url` here: Next derives og:url per route from metadataBase + canonical, so legal pages stop claiming to be the home page.
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SEO.homeTitle,
    description: SEO.homeDescription,
    locale: "en_GB",
    images: [SEO.shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.homeTitle,
    description: SEO.homeDescription,
    images: [SEO.shareImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#fdfbf7",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-pine-800 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <JsonLd data={graph(organisation(), tutorPerson(), website())} />
      </body>
    </html>
  );
}
