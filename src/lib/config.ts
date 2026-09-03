/**
 * Central configuration for the tutoring site.
 * Edit prices, session types and weekly hours here. Everything else derives from it.
 */

export const TIMEZONE = "Europe/London";

export type ServiceLevel = "intro" | "gcse" | "alevel" | "medicine";

export type Service = {
  id: string;
  name: string;
  shortName: string;
  level: ServiceLevel;
  tagline: string;
  description: string;
  durationMinutes: number;
  /** Price in pence. 0 means free (no Stripe checkout). */
  pricePence: number;
  highlights: string[];
  /** Shown as a badge on the pricing card, e.g. "Most popular". */
  badge?: string;
  /** Earliest bookable time for this session type, in hours from now. Overrides AVAILABILITY.minNoticeHours. */
  minNoticeHours?: number;
};

export const SERVICES: Service[] = [
  {
    id: "intro-call",
    name: "Free introductory call",
    shortName: "Intro call",
    level: "intro",
    tagline: "Talk through goals, exam boards and how sessions would work. Nothing to pay.",
    description:
      "We talk through where the student is now, what they are aiming for, and how I would structure sessions. No obligation and nothing to pay.",
    durationMinutes: 20,
    pricePence: 0,
    highlights: ["Meet before you commit", "Discuss goals and exam boards", "Agree a plan and schedule"],
    // A free call needs no preparation, so it can be booked at much shorter notice than a paid session.
    minNoticeHours: 8,
  },
  {
    id: "gcse-60",
    name: "GCSE tutoring",
    shortName: "GCSE",
    level: "gcse",
    tagline: "Any GCSE subject. Exam-board lessons with past papers and technique.",
    description:
      "One-to-one sessions built around the student's exam board, with exam technique and past-paper practice woven into every lesson.",
    durationMinutes: 60,
    pricePence: 3000,
    highlights: ["Any GCSE subject", "AQA, Edexcel and OCR", "Homework and past-paper feedback"],
  },
  {
    id: "alevel-60",
    name: "A-level tutoring",
    shortName: "A-level",
    level: "alevel",
    tagline: "Any A-level subject. Topic work, mark schemes and full-mark answers.",
    description:
      "Sessions on the topics that cost marks, using the specification and examiner reports so answers match what the paper actually rewards.",
    durationMinutes: 60,
    pricePence: 3500,
    highlights: ["Any A-level subject", "Planned from the exam board", "Weekly progress notes"],
    badge: "Most popular",
  },
  {
    // One session type covers the whole medicine application. The Stripe product for it keeps this id;
    // the former "ucat-60" product is archived and its calendar bookings still count under their old id.
    id: "medicine-60",
    name: "UCAT and medical school coaching",
    shortName: "Medicine",
    level: "medicine",
    tagline: "UCAT strategy, personal statements, mock interviews and choosing where to apply.",
    description:
      "Everything in a medicine application, in whichever order you need it: UCAT strategy with timed practice across all four sections, personal statement reviews, MMI and panel interview practice, school selection and the UCAS timeline.",
    durationMinutes: 60,
    pricePence: 3000,
    highlights: ["UCAT strategy and timed drills", "Personal statement feedback", "MMI and panel mock interviews"],
  },
];

export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

/** Minimum booking notice for a service: its own override, else the site-wide default. */
export function serviceMinNoticeHours(service: Pick<Service, "minNoticeHours">): number {
  return service.minNoticeHours ?? AVAILABILITY.minNoticeHours;
}

/** "HH:MM" local London time windows per weekday. 0 = Sunday ... 6 = Saturday. */
export type TimeWindow = [string, string];

export const AVAILABILITY = {
  timezone: TIMEZONE,
  weekly: {
    0: [["09:00", "17:00"]],
    1: [["17:00", "21:00"]],
    2: [["17:00", "21:00"]],
    3: [["17:00", "21:00"]],
    4: [["17:00", "21:00"]],
    5: [["17:00", "21:00"]],
    6: [["09:00", "17:00"]],
  } as Record<number, TimeWindow[]>,
  /** Slots are offered every N minutes from the start of each window. */
  slotIntervalMinutes: 30,
  /** Gap kept free before and after any existing calendar event. */
  bufferMinutes: 15,
  /** Default earliest bookable time, now + this many hours. A service can override it (see Service.minNoticeHours). */
  minNoticeHours: 24,
  /** Latest bookable date is today + this many days. */
  maxDaysAhead: 60,
  /** A slot is held in the calendar for this long while the student pays. Must exceed checkoutMinutes. */
  holdMinutes: 40,
  /** How long the Stripe Checkout page stays open. Stripe's minimum is 30. */
  checkoutMinutes: 31,
};

export const SITE = {
  name: process.env.SITE_NAME || "Preethi Amudhan Tutoring",
  tutorName: "Preethi Amudhan",
  tagline: "GCSE, A-level, UCAT and medicine tutoring from a final-year medical student",
  contactEmail: process.env.CONTACT_EMAIL || "preethinorwich@gmail.com",
  phone: "07448 609 094",
  /** E.164 form for tel: links and structured data. */
  phoneE164: "+447448609094",
  showPhone: true,
  location: "Norwich, UK",
  cancellationNoticeHours: 24,
  /** Discount on the session rate for bulk sessions arranged directly by email or phone (not bookable online). */
  blockDiscountPercent: 20,
};

export function formatPrice(pence: number): string {
  if (pence === 0) return "Free";
  const pounds = pence / 100;
  return Number.isInteger(pounds) ? `£${pounds}` : `£${pounds.toFixed(2)}`;
}
