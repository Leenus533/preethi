/**
 * Content for the four subject landing pages (/tutoring/<slug>) and the Subjects section on the
 * home page. Each entry maps to one bookable service in config.ts. Keep every claim here
 * consistent with the About section: the same results, the same experience, nothing new.
 */
import { getService } from "./config";

export type SubjectMotif = "graph" | "helix" | "clock" | "stethoscope";

export type SubjectFaq = { q: string; a: string };

export type Subject = {
  slug: string;
  /** Used in cards and navigation. */
  title: string;
  /** The page's H1. Written for the search a parent or student actually types. */
  heading: string;
  /** <title> for the page, under 60 characters. */
  metaTitle: string;
  /** Meta description, 140 to 160 characters. */
  metaDescription: string;
  keywords: string[];
  serviceId: string;
  motif: SubjectMotif;
  /** One-line summary for the card. */
  blurb: string;
  /** Small print under the blurb on the card. */
  detail: string;
  /** Lead paragraph on the landing page. */
  lead: string;
  /** What a course of sessions covers. */
  covers: { title: string; text: string }[];
  /** Who the sessions suit. */
  whoFor: string[];
  /** The approach, in Preethi's voice. */
  approach: string[];
  /** Why Preethi in particular, drawn from her record. */
  credentials: string[];
  faqs: SubjectFaq[];
};

export const SUBJECTS: Subject[] = [
  {
    slug: "gcse",
    title: "GCSE",
    heading: "Online GCSE tutoring in any subject",
    metaTitle: "GCSE Tutor Online, Any Subject | Preethi Amudhan",
    metaDescription:
      "One-to-one online GCSE tutoring in any subject, with Maths and the sciences as specialisms. AQA, Edexcel and OCR. Grade 9 tutor, £30 an hour, book online.",
    keywords: ["GCSE tutor", "GCSE tutor online", "GCSE maths tutor online", "GCSE science tutor", "GCSE chemistry tutor", "GCSE biology tutor", "GCSE physics tutor", "Norwich GCSE tutor"],
    serviceId: "gcse-60",
    motif: "graph",
    blurb: "Build the foundations properly and learn how to score the marks on the paper.",
    detail: "Any GCSE subject. Maths and the sciences are specialisms. AQA, Edexcel and OCR.",
    lead:
      "One-to-one GCSE sessions in whichever subjects need the work, planned around your exam board and the grade you are aiming for. Maths, Biology, Chemistry, Physics and Combined Science are the specialisms, but any GCSE subject can be booked. Taught online by a final-year medical student who got grade 9s across the board herself.",
    covers: [
      { title: "The topics costing marks", text: "We start from a recent paper or mock, find the questions that went wrong, and fix the idea underneath rather than the individual question." },
      { title: "Exam technique", text: "Command words, mark schemes, extended answers and the show-your-working habits that examiners reward. These transfer across every subject." },
      { title: "The specialisms in depth", text: "In Maths and the sciences: required practicals, rearranging, units and graph skills, and the six-mark questions that decide grades." },
      { title: "A revision plan that fits", text: "Short, realistic homework between sessions and a clear list of what to practise, so the next session starts from progress." },
    ],
    whoFor: [
      "Year 10 and 11 students aiming for grades 7 to 9 in any subject",
      "Students who understand the classwork but lose marks under exam conditions",
      "Anyone on AQA, Edexcel or OCR who wants sessions planned from their specification",
      "Year 9 students who want a confident start to the GCSE course",
    ],
    approach: [
      "Most students who say they are bad at a subject are actually missing one or two ideas and a lot of exam practice. I find those ideas quickly and we practise until the marks come naturally.",
      "Every session ends with a short note of what we did and what to try before next time, so parents can see progress without sitting in, though they are always welcome to.",
    ],
    credentials: [
      "Grade 9 in GCSE Biology, Chemistry, Physics, Computer Science and Geography",
      "A full academic year as a sixth-form subject mentor, running one-to-one and group sessions",
      "Enhanced DBS check held through UEA Medical School",
    ],
    faqs: [
      { q: "Which GCSE subjects do you tutor?", a: "Any of them. Maths, Biology, Chemistry, Physics and Combined Science are the specialisms, and Preethi also got grade 9s in Computer Science and Geography. If you want help in a subject not listed here, mention it at booking or on the free intro call. Sessions can also alternate between two subjects." },
      { q: "Do you cover my exam board?", a: "Yes. AQA, Edexcel and OCR. Tell me the subject, board and tier at booking and I will plan from that specification." },
      { q: "How often should we book?", a: "Weekly sessions work best in Year 11. In the final weeks before exams, some families prefer two sessions a week focused on past papers. There is no minimum commitment either way." },
      { q: "Can a parent sit in?", a: "Always. Sessions run over Google Meet and a parent is welcome to join for any part of any session." },
    ],
  },
  {
    slug: "a-level",
    title: "A-level",
    heading: "Online A-level tutoring, any subject",
    metaTitle: "A-level Tutor Online, Any Subject | Preethi Amudhan",
    metaDescription:
      "One-to-one online A-level tutoring in any subject. Biology, Chemistry and Maths specialist with A, A, A, now a final-year medic. AQA, Edexcel, OCR. £35/hr.",
    keywords: ["A-level tutor", "A-level tutor online", "A-level chemistry tutor", "A-level biology tutor online", "A-level maths tutor", "A level tutor Norwich", "online A-level tutoring"],
    serviceId: "alevel-60",
    motif: "helix",
    blurb: "Topic-by-topic depth, plus the exam technique that separates a B from an A.",
    detail: "Any A-level subject. Biology, Chemistry and Maths are specialisms, with an A in each.",
    lead:
      "One-to-one A-level tutoring in any subject, planned around your specification, your predicted grade and the grade you actually need. Biology, Chemistry and Maths are the specialisms: Preethi got an A in all three at Sir Isaac Newton Sixth Form before going on to study Medicine, and any other A-level can be booked too.",
    covers: [
      { title: "The hard topics, properly", text: "The topics that decide grades, explained from first principles until they hold up under exam pressure. In the sciences: organic mechanisms, equilibria and buffers, genetics and gene technologies, integration and mechanics." },
      { title: "How examiners think", text: "We work through mark schemes and examiner reports together so you learn what a full-mark answer looks like and stop losing marks on questions you understood." },
      { title: "Synoptic and application questions", text: "The unfamiliar-context questions that A-level papers now lean on, and how to reason through them calmly under time pressure." },
      { title: "Essays, practicals and data", text: "Structured extended answers where the paper asks for them; required practicals, uncertainty and data questions in the sciences." },
    ],
    whoFor: [
      "Year 12 students who want to get ahead before the content piles up",
      "Year 13 students turning a predicted B or C into the A or A* an offer needs",
      "Students on AQA, Edexcel or OCR who want sessions planned from their specification",
      "Anyone applying for medicine, dentistry or biomedical courses who needs strong science grades",
    ],
    approach: [
      "I sat these exams recently and, in the sciences, use the same content every week in medical school, so I can explain why a topic matters as well as how to answer questions on it.",
      "We keep a running list of weak topics and re-test them a few weeks later. That spaced retrieval is what makes the difference in the final exam.",
    ],
    credentials: [
      "A in A-level Biology, A in Chemistry, A in Maths",
      "Final-year Medicine MBBS at the University of East Anglia",
      "A year as a student subject mentor at her former sixth form, reporting progress back to teachers",
    ],
    faqs: [
      { q: "Which A-level subjects do you tutor?", a: "Any A-level subject. Biology, Chemistry and Maths are the specialisms, where Preethi has an A in each and uses the content daily in medical school. For any other subject, mention it at booking or on the free intro call so sessions can be planned from your specification." },
      { q: "Do you help with Year 12 as well as Year 13?", a: "Yes. Year 12 is the best time to start: the habits and foundations built then are what make Year 13 manageable." },
      { q: "Can you help with predicted grades and UCAS?", a: "Sessions focus on the subject, but because I have been through a medicine application I am happy to talk about how grades and predictions affect applications, and the medical school coaching sessions cover that in depth." },
      { q: "How long is a session?", a: "Sixty minutes, one-to-one, online over Google Meet. Longer blocks can be arranged by booking consecutive slots." },
    ],
  },
  {
    slug: "ucat",
    title: "UCAT",
    heading: "UCAT tutoring from a top 10% scorer",
    metaTitle: "UCAT Tutor Online, Top 10% Scorer | Preethi Amudhan",
    metaDescription:
      "One-to-one online UCAT tutoring across all four sections, with timed drills and a personal strategy, from a top 10% scorer now a final-year medic. £40/hr.",
    keywords: ["UCAT tutor", "UCAT tutoring online", "UCAT preparation", "UCAT coaching", "UCAT verbal reasoning help", "medicine entrance exam tutor"],
    serviceId: "ucat-60",
    motif: "clock",
    blurb: "Strategy and timing for every section, from someone who scored in the top 10%.",
    detail: "Verbal Reasoning, Decision Making, Quantitative Reasoning and Situational Judgement.",
    lead:
      "The UCAT is a test of strategy and timing as much as knowledge. One-to-one sessions take each section in turn, work out where your time and marks are going, and build a personal approach you can hold under pressure on test day.",
    covers: [
      { title: "Verbal Reasoning", text: "Skimming strategies, keyword hunting, and the discipline to flag and move on. This is the section where timing decides the score." },
      { title: "Decision Making", text: "Syllogisms, probability, Venn diagrams and argument questions, with a method for each question type so nothing feels new on the day." },
      { title: "Quantitative Reasoning", text: "Fast mental arithmetic, estimation, and knowing which questions to skip. Most students can gain a band here with technique alone." },
      { title: "Situational Judgement", text: "What the GMC's Good Medical Practice actually expects and how to read the scenarios the way the examiners do." },
    ],
    whoFor: [
      "Year 12 students sitting the UCAT this summer",
      "Students whose mock scores have plateaued and need a change of method rather than more questions",
      "Anyone who wants a structured plan for the last six to eight weeks before the test",
      "Reapplicants who want an honest review of last year's score report",
    ],
    approach: [
      "We start with a timed diagnostic, then spend each session on one section with a clear technique, timed drills and a review of every wrong answer. Between sessions you practise the technique, not just more questions.",
      "I scored in the top 10% recently enough to remember which of the many strategies in circulation actually hold up under time pressure, and which just sound good.",
    ],
    credentials: [
      "Top 10% UCAT score",
      "Final-year medical student at the University of East Anglia",
      "Sessions include a score-tracking sheet so you can see each section moving",
    ],
    faqs: [
      { q: "When should I start UCAT preparation?", a: "Six to eight weeks of focused practice before your test date is enough for most students. Starting earlier is fine, but the technique work needs to be close to the test to stick." },
      { q: "Do you provide question banks?", a: "No. Sessions work alongside the official UCAT practice materials and whichever question bank you are using, and I will recommend how to use them well." },
      { q: "Which section is worth the most time?", a: "It depends on your diagnostic. Quantitative and Decision Making usually respond fastest to technique. Verbal Reasoning is the hardest to move, so we set realistic targets there." },
      { q: "Can we also cover the medicine application?", a: "Yes. Personal statements, work experience reflection and interviews are covered in the medical school application coaching sessions, and the two are designed to be booked alongside each other." },
    ],
  },
  {
    slug: "medical-school-applications",
    title: "Medical school applications",
    heading: "Medical school application coaching from a final-year medic",
    metaTitle: "Medical School Application Coaching | Preethi Amudhan",
    metaDescription:
      "Personal statement reviews, MMI and panel interview practice and honest advice on where to apply, from a final-year UEA medical student. Online, £40/hr.",
    keywords: ["medical school application help", "medicine personal statement review", "MMI interview practice", "medicine interview coaching", "how to get into medical school UK"],
    serviceId: "medicine-60",
    motif: "stethoscope",
    blurb: "Personal statement reviews, mock interviews and honest advice on where to apply.",
    detail: "Personal statements, MMI and panel practice, and the UCAS timeline.",
    lead:
      "Applying to medicine is a series of decisions with deadlines: where to apply, what to write, how to talk about your experience, how to prepare for interviews that all run differently. One-to-one coaching from someone who went through it recently, and now works alongside the doctors you are hoping to join.",
    covers: [
      { title: "Choosing where to apply", text: "How each school weighs the UCAT, GCSEs, predicted grades and the personal statement, and how to build four choices that give you the best chance." },
      { title: "Personal statement", text: "Line-by-line feedback across as many drafts as you need, focused on reflection rather than listing, in your own voice." },
      { title: "Interview practice", text: "Realistic MMI stations and panel questions, timed, with honest feedback after each. Ethics scenarios, role plays, data interpretation and motivation questions." },
      { title: "Work experience and reflection", text: "Turning what you saw into what you learned, using the framework medical schools actually assess." },
    ],
    whoFor: [
      "Year 12 students planning a medicine application for the coming cycle",
      "Year 13 applicants with interviews coming up",
      "Gap-year and reapplicants who want to understand what to change",
      "Students who have nobody in the family who has been through a medicine application",
    ],
    approach: [
      "I remember exactly how opaque this process felt from the outside. My aim is to make it clear and to give honest feedback early, while there is still time to act on it.",
      "Mock interviews are run properly: timed stations, no hints, then a detailed debrief. Practice only helps when it feels real.",
    ],
    credentials: [
      "Final-year Medicine MBBS at the University of East Anglia, started in 2022",
      "Top 10% UCAT score and A, A, A at A-level",
      "More than eight years in patient-facing roles, so the reflection advice comes from real experience",
    ],
    faqs: [
      { q: "How many sessions does a personal statement take?", a: "Plan for two or three: one to plan the statement and one or two to review drafts. You book them as you need them rather than committing up front." },
      { q: "Do you run MMI practice?", a: "Yes. Each interview session covers several timed stations with feedback after each, matched to the formats of the schools you have applied to." },
      { q: "Can you tell me which medical schools to apply to?", a: "I can show you how each school scores applicants and help you weigh your options honestly, then the decision is yours. Choosing well is often the single biggest thing an applicant can do." },
      { q: "Do you guarantee an offer?", a: "No one honestly can. What I can promise is clear feedback, realistic practice and the current picture from inside a medical school." },
    ],
  },
];

export function getSubject(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}

export function subjectPath(subject: Pick<Subject, "slug">): string {
  return `/tutoring/${subject.slug}`;
}

export function subjectService(subject: Subject) {
  const service = getService(subject.serviceId);
  if (!service) throw new Error(`Subject ${subject.slug} points at unknown service ${subject.serviceId}`);
  return service;
}

export function subjectBookingHref(subject: Subject): string {
  return `/book?service=${subject.serviceId}`;
}
