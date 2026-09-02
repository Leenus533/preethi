import Link from "next/link";
import { SERVICES, SITE, formatPrice } from "@/lib/config";
import { Icon } from "@/components/ui/icons";
import { TutorPortrait } from "./TutorPortrait";

/** Section header: a quiet running head in the left column, the claim in the right. */
function SectionHead({ head, title, children }: { head: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="grid gap-3 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-x-16">
      <p className="running-head lg:pt-2">{head}</p>
      <div>
        <h2 className="font-display font-display-lg text-[length:var(--text-h2)] leading-[1.12] text-pine-900">{title}</h2>
        {children && <div className="measure mt-4 text-ink-soft">{children}</div>}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section>
      <div className="container-x grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h1 className="font-display font-display-xl text-[length:var(--text-display)] leading-[1.04] text-balance text-pine-900">
            Science, maths and medicine tutoring that makes the hard parts click.
          </h1>
          <p className="mt-6 max-w-[var(--measure-lead)] text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
            I&rsquo;m Preethi, a final-year medical student at the University of East Anglia. I teach online from Norwich, helping
            GCSE and A-level students turn &ldquo;I don&rsquo;t get it&rdquo; into confident exam answers, and coaching future medics
            through the UCAT and their applications.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/book?service=intro-call" className="btn btn-primary">
              Book a free intro call <Icon.Arrow width={18} height={18} />
            </Link>
            <Link href="/#pricing" className="btn btn-secondary">
              See subjects and prices
            </Link>
          </div>
          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-cream-200 pt-6">
            {[
              ["A, A, A", "A-level Biology, Chemistry, Maths"],
              ["Top 10%", "UCAT score"],
              ["Grade 9", "GCSE Biology, Chemistry, Physics"],
            ].map(([big, small]) => (
              <div key={big}>
                <dt className="font-display text-2xl text-pine-800 sm:text-3xl">{big}</dt>
                <dd className="mt-1 text-[length:var(--text-meta)] leading-snug text-muted">{small}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mx-auto w-full max-w-sm lg:max-w-none">
          <TutorPortrait />
        </div>
      </div>
    </section>
  );
}

const trust = [
  "Final-year Medicine MBBS at the University of East Anglia",
  "Enhanced DBS check held through UEA Medical School",
  "A full academic year as a sixth-form subject mentor",
  "Online over Google Meet, with a calendar invitation sent automatically",
];

export function TrustStrip() {
  return (
    <section aria-label="Credentials" className="border-y border-cream-200">
      <ul className="container-x grid gap-x-10 gap-y-3 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {trust.map((text) => (
          <li key={text} className="text-[0.9375rem] leading-snug text-ink-soft">
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}

const subjects = [
  {
    title: "GCSE",
    blurb: "Build the foundations properly and learn how to score the marks on the paper.",
    detail: "Maths, Biology, Chemistry, Physics and Combined Science. AQA, Edexcel and OCR.",
    serviceId: "gcse-60",
  },
  {
    title: "A-level",
    blurb: "Topic-by-topic depth, plus the exam technique that separates a B from an A.",
    detail: "Biology, Chemistry and Maths, taught by someone who got an A in each.",
    serviceId: "alevel-60",
  },
  {
    title: "UCAT",
    blurb: "Strategy and timing for every section, from someone who scored in the top 10%.",
    detail: "Verbal Reasoning, Decision Making, Quantitative Reasoning and Situational Judgement.",
    serviceId: "ucat-60",
  },
  {
    title: "Medical school applications",
    blurb: "Personal statement reviews, mock interviews and honest advice on where to apply.",
    detail: "Personal statements, MMI and panel practice, and the UCAS timeline.",
    serviceId: "medicine-60",
  },
];

export function Subjects() {
  return (
    <section id="subjects" className="section scroll-mt-24">
      <div className="container-x section-grid">
        <SectionHead head="Subjects" title="One-to-one, built around your exam board">
          <p>Every session is planned around the student&rsquo;s specification and target grade.</p>
        </SectionHead>
        <ol className="border-t border-cream-200 lg:ml-[calc(10rem+4rem)]">
          {subjects.map((s) => (
            <li key={s.title}>
              <Link
                href={`/book?service=${s.serviceId}`}
                className="focus-ring group grid gap-x-10 gap-y-1 border-b border-cream-200 py-6 sm:grid-cols-[12rem_minmax(0,1fr)]"
              >
                <h3 className="font-display text-[length:var(--text-h3)] text-pine-700 underline-offset-4 group-hover:underline">{s.title}</h3>
                <div className="measure">
                  <p className="text-ink-soft">{s.blurb}</p>
                  <p className="mt-1 text-[length:var(--text-meta)] text-muted">{s.detail}</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const steps = [
  {
    title: "Start with a free intro call",
    text: "Twenty minutes to talk about goals, exam boards and how sessions would work. No pressure, nothing to pay.",
  },
  {
    title: "Pick a time that suits",
    text: "The booking calendar shows live availability. Choose a slot, add a few details and you are done.",
  },
  {
    title: "Pay securely, get your invite",
    text: "Card payment through Stripe. A Google Calendar invitation with the Meet link lands in your inbox straight away.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section scroll-mt-24">
      <div className="container-x section-grid">
        <SectionHead head="How it works" title="Three steps from first message to first session" />
        <ol className="grid gap-8 border-t border-cream-200 pt-10 md:grid-cols-3 lg:ml-[calc(10rem+4rem)]">
          {steps.map((s, i) => (
            <li key={s.title}>
              <span className="font-display text-3xl text-pine-600">{i + 1}</span>
              <h3 className="mt-2 font-display text-[length:var(--text-h3)] text-pine-900">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="section scroll-mt-24">
      <div className="container-x section-grid">
        <SectionHead head="About Preethi" title="A tutor who knows the current specifications, and remembers what was hard" />
        <div className="grid gap-[var(--space-item)] lg:ml-[calc(10rem+4rem)]">
          <div className="measure grid gap-[var(--space-item)] leading-relaxed text-ink-soft">
            <p>
              I went to school in Norwich, took Biology, Chemistry and Maths at Sir Isaac Newton Sixth Form and got an A in each.
              Before that I picked up grade 9s in GCSE Biology, Chemistry, Physics, Computer Science and Geography. I scored in the
              top 10% on the UCAT and started Medicine at the University of East Anglia in 2022. I&rsquo;m now in my final year.
            </p>
            <p>
              After my A-levels I spent a year as a student subject mentor at my old sixth form, running one-to-one and group
              sessions, online and in person, and reporting back to teachers on progress. That is where I learned that most
              &ldquo;I&rsquo;m just bad at chemistry&rdquo; problems are really one or two missing ideas plus a lack of exam
              practice, and both are fixable.
            </p>
            <p>
              Alongside my degree I work front-of-house in a private physiotherapy clinic and have spent more than eight years in
              patient-facing roles, so I&rsquo;m used to explaining complicated things calmly to people of all ages. I hold an
              Enhanced DBS check through the medical school, and parents are always welcome to sit in on sessions.
            </p>
          </div>
          <ul className="grid gap-2 border-t border-cream-200 pt-[var(--space-item)] sm:grid-cols-2">
            {[
              "Sessions planned around your exam board and specification",
              "Clear notes on what to practise before the next session",
              "Exam-style questions worked through together",
              "Honest, current advice on medicine applications",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-[0.9375rem] text-ink-soft">
                <Icon.Check width={17} height={17} className="mt-0.5 shrink-0 text-pine-600" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Pricing() {
  const cheapest = Math.min(...SERVICES.filter((s) => s.pricePence > 0).map((s) => s.pricePence));
  return (
    <section id="pricing" className="section scroll-mt-24">
      <div className="container-x section-grid">
        <SectionHead head="Prices" title={`From ${formatPrice(cheapest)} an hour, paid per session`}>
          <p>
            No packages and no minimum commitment. Reschedule free with {SITE.cancellationNoticeHours} hours&rsquo; notice.
          </p>
        </SectionHead>
        <ul className="border-t border-cream-200 lg:ml-[calc(10rem+4rem)]">
          {SERVICES.map((s) => (
            <li
              key={s.id}
              className="grid items-baseline gap-x-8 gap-y-3 border-b border-cream-200 py-6 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
            >
              <div className="measure">
                <h3 className="font-display text-[length:var(--text-h3)] text-pine-900">
                  {s.name}
                  {s.badge && <span className="ml-3 align-middle text-[length:var(--text-meta)] font-sans font-medium text-clay-700">{s.badge}</span>}
                </h3>
                <p className="mt-1 text-[0.9375rem] text-ink-soft">{s.tagline}</p>
                <p className="mt-1 text-[length:var(--text-meta)] text-muted">
                  {s.durationMinutes} minutes · {s.highlights.join(" · ")}
                </p>
              </div>
              <p className="font-display text-3xl tabular-nums text-ink sm:justify-self-end">{formatPrice(s.pricePence)}</p>
              <Link href={`/book?service=${s.id}`} className={`btn sm:justify-self-end ${s.pricePence === 0 ? "btn-secondary" : "btn-primary"}`}>
                {s.pricePence === 0 ? "Book free call" : "Book and pay"}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "Are sessions online or in person?",
    a: "Online by default, over Google Meet, so students anywhere in the UK can book. If you are in Norwich and would prefer in-person sessions, mention it on the intro call and we can see what works.",
  },
  {
    q: "Which exam boards do you cover?",
    a: "AQA, Edexcel and OCR for GCSE and A-level. Tell me the board and specification when you book and I will plan around it.",
  },
  {
    q: "How does payment work?",
    a: "You pay by card when you book, through Stripe. Preethi never sees your card details. You get an emailed receipt and a calendar invitation with the Google Meet link.",
  },
  {
    q: "What if we need to cancel or move a session?",
    a: `Reschedule or cancel free of charge with at least ${SITE.cancellationNoticeHours} hours' notice by replying to your booking email. Sessions cancelled with less notice are charged in full, except in genuine emergencies.`,
  },
  {
    q: "Is Preethi a qualified teacher?",
    a: "No. Preethi is a final-year medical student with a year of formal sixth-form mentoring experience and strong results in the subjects she teaches. Many families prefer a tutor who sat the exams recently and knows the current specifications.",
  },
  {
    q: "What about safeguarding?",
    a: "Preethi holds an Enhanced DBS check through UEA Medical School. Parents and guardians are welcome to sit in on any session. For students under 18, please add a parent or guardian's name at booking and use an email address a parent can see.",
  },
  {
    q: "Do you offer group sessions or packages?",
    a: "Not at the moment. Every session is one-to-one and paid per session, so you only ever pay for what you use.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="section scroll-mt-24">
      <div className="container-x section-grid">
        <SectionHead head="Questions" title="Questions parents ask before booking">
          <p>
            Anything else? Email{" "}
            <a href={`mailto:${SITE.contactEmail}`} className="focus-ring font-medium text-pine-700 underline underline-offset-4">
              {SITE.contactEmail}
            </a>
            .
          </p>
        </SectionHead>
        <div className="border-t border-cream-200 lg:ml-[calc(10rem+4rem)]">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-cream-200 py-4">
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-pine-900">
                {f.q}
                <span className="shrink-0 text-xl leading-none text-pine-600 transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="measure mt-3 leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="section !border-t-0">
      <div className="container-x">
        <div className="bg-pine-900 px-8 py-14 text-white sm:px-14">
          <h2 className="font-display font-display-lg max-w-xl text-[length:var(--text-h2)] leading-[1.12]">
            Start with a free 20-minute intro call
          </h2>
          <p className="measure mt-3 text-pine-100">
            Pick a time on the live calendar. If it turns out I&rsquo;m not the right fit, you&rsquo;ve lost nothing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book?service=intro-call" className="btn btn-invert">
              Book the free call
            </Link>
            <Link href="/book" className="btn border border-pine-200 text-white hover:bg-white/10">
              Book a paid session
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
