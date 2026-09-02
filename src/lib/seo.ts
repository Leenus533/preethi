/**
 * Structured data (schema.org JSON-LD) and shared metadata values.
 * Everything here derives from config.ts and subjects.ts so it can never drift from the page copy.
 */
import { SERVICES, SITE, type Service } from "./config";
import { subjectPath, subjectService, type Subject } from "./subjects";
import { siteOrigin } from "./site-url";

export const SEO = {
  /** Shown in <title> on the home page. Under 60 characters. */
  homeTitle: "Online GCSE, A-level, UCAT & Medicine Tutor | Preethi Amudhan",
  homeDescription:
    "One-to-one online tutoring in GCSE and A-level Maths, Biology and Chemistry, UCAT prep and medicine applications from a final-year medical student. From £30/hr.",
  keywords: [
    "online tutor",
    "GCSE tutor",
    "A-level tutor",
    "chemistry tutor",
    "biology tutor",
    "maths tutor",
    "UCAT tutor",
    "medical school application help",
    "medicine interview coaching",
    "Norwich tutor",
    "medical student tutor",
  ],
  /** Date the content was last materially revised. Used in the sitemap instead of the build time. */
  contentUpdated: new Date("2026-09-02"),
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteOrigin()).toString();
}

const ORG_ID = () => `${siteOrigin()}/#organization`;
const PERSON_ID = () => `${siteOrigin()}/#tutor`;
const WEBSITE_ID = () => `${siteOrigin()}/#website`;

function offer(service: Service) {
  return {
    "@type": "Offer",
    name: service.name,
    description: service.description,
    price: (service.pricePence / 100).toFixed(2),
    priceCurrency: "GBP",
    availability: "https://schema.org/InStock",
    url: absoluteUrl(`/book?service=${service.id}`),
    eligibleDuration: { "@type": "QuantitativeValue", value: service.durationMinutes, unitCode: "MIN" },
  };
}

export function tutorPerson() {
  return {
    "@type": "Person",
    "@id": PERSON_ID(),
    name: SITE.tutorName,
    jobTitle: "Private tutor and final-year medical student",
    email: SITE.contactEmail,
    url: siteOrigin(),
    worksFor: { "@id": ORG_ID() },
    alumniOf: [{ "@type": "EducationalOrganization", name: "Sir Isaac Newton Sixth Form" }],
    affiliation: { "@type": "CollegeOrUniversity", name: "University of East Anglia" },
    knowsAbout: ["GCSE Maths", "GCSE Biology", "GCSE Chemistry", "GCSE Physics", "A-level Biology", "A-level Chemistry", "A-level Maths", "UCAT", "Medical school applications"],
    address: { "@type": "PostalAddress", addressLocality: "Norwich", addressCountry: "GB" },
  };
}

export function organisation() {
  return {
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "@id": ORG_ID(),
    name: SITE.name,
    url: siteOrigin(),
    image: absoluteUrl("/opengraph-image"),
    logo: absoluteUrl("/icon.svg"),
    description: SEO.homeDescription,
    email: SITE.contactEmail,
    ...(SITE.showPhone ? { telephone: SITE.phone } : {}),
    founder: { "@id": PERSON_ID() },
    employee: { "@id": PERSON_ID() },
    address: { "@type": "PostalAddress", addressLocality: "Norwich", addressRegion: "Norfolk", addressCountry: "GB" },
    areaServed: { "@type": "Country", name: "United Kingdom" },
    priceRange: "£30 - £40 per hour",
    currenciesAccepted: "GBP",
    paymentAccepted: "Credit card, Debit card",
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "17:00", closes: "21:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday"], opens: "09:00", closes: "17:00" },
    ],
    makesOffer: SERVICES.filter((s) => s.pricePence > 0).map(offer),
  };
}

export function website() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID(),
    url: siteOrigin(),
    name: SITE.name,
    inLanguage: "en-GB",
    publisher: { "@id": ORG_ID() },
  };
}

export function faqPage(items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function subjectServiceSchema(subject: Subject) {
  const service = subjectService(subject);
  return {
    "@type": "Service",
    "@id": `${absoluteUrl(subjectPath(subject))}#service`,
    name: service.name,
    serviceType: `${subject.title} tutoring`,
    description: subject.metaDescription,
    url: absoluteUrl(subjectPath(subject)),
    provider: { "@id": ORG_ID() },
    areaServed: { "@type": "Country", name: "United Kingdom" },
    availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/book"), name: "Online via Google Meet" },
    audience: { "@type": "EducationalAudience", educationalRole: "student" },
    offers: offer(service),
  };
}

export function webPage(path: string, name: string, description: string) {
  return {
    "@type": "WebPage",
    "@id": absoluteUrl(path),
    url: absoluteUrl(path),
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID() },
    about: { "@id": ORG_ID() },
    inLanguage: "en-GB",
  };
}

/** Wraps any number of schema nodes in one @graph document. */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
