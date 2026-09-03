/**
 * Central configuration for the tutoring site.
 * Edit prices, session types and weekly hours here. Everything else derives from it.
 */

export const TIMEZONE = "Europe/London";

export type ServiceLevel = "intro" | "gcse" | "alevel" | "ucat" | "medicine";

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
};

export const SERVICES: Service[] = [
  {
    id: "intro-call",
    name: "Free introductory call",
    shortName: "Intro call",
    level: "intro",
    tagline: "A relaxed 20-minute chat to see if we are a good fit.",
    description:
      "We talk through where the student is now, what they are aiming for, and how I would structure sessions. No obligation and nothing to pay.",
    durationMinutes: 20,
    pricePence: 0,
    highlights: ["Meet before you commit", "Discuss goals and exam boards", "Agree a plan and schedule"],
  },
  {
    id: "gcse-60",
    name: "GCSE tutoring",
    shortName: "GCSE",
    level: "gcse",
    tagline: "Any GCSE subject, aiming for grades 7 to 9. Maths and sciences are specialisms.",
    description:
      "One-to-one sessions built around the student's exam board, with exam technique and past-paper practice woven into every lesson.",
    durationMinutes: 60,
    pricePence: 3000,
    highlights: ["Any subject; Maths and sciences specialist", "AQA, Edexcel and OCR", "Homework and past-paper feedback"],
  },
  {
    id: "alevel-60",
    name: "A-level tutoring",
    shortName: "A-level",
    level: "alevel",
    tagline: "Any A-level subject. Biology, Chemistry and Maths specialist with A, A, A.",
    description:
      "Deep-dive sessions on the topics that cost students marks, with a focus on how examiners think and how to write full-mark answers.",
    durationMinutes: 60,
    pricePence: 3500,
    highlights: ["Any subject; Biology, Chemistry, Maths specialist", "Exam-board specific", "Weekly progress notes"],
    badge: "Most popular",
  },
  {
    id: "ucat-60",
    name: "UCAT preparation",
    shortName: "UCAT",
    level: "ucat",
    tagline: "Strategies from a top-10% UCAT scorer.",
    description:
      "Section-by-section coaching for Verbal Reasoning, Decision Making, Quantitative Reasoning and Situational Judgement, with timed practice and review.",
    durationMinutes: 60,
    pricePence: 4000,
    highlights: ["Timing and triage strategy", "Question-type drills", "Mock review and score tracking"],
  },
  {
    id: "medicine-60",
    name: "Medical school application coaching",
    shortName: "Med school",
    level: "medicine",
    tagline: "Personal statements, interviews and choosing the right schools.",
    description:
      "Honest, current guidance from a final-year medical student: personal statement reviews, MMI and panel interview practice, and work-experience reflection.",
    durationMinutes: 60,
    pricePence: 4000,
    highlights: ["Personal statement feedback", "MMI and panel mock interviews", "School selection and UCAS timeline"],
  },
];

export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
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
  /** Earliest bookable time is now + this many hours. */
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
};

export function formatPrice(pence: number): string {
  if (pence === 0) return "Free";
  const pounds = pence / 100;
  return Number.isInteger(pounds) ? `£${pounds}` : `£${pounds.toFixed(2)}`;
}
