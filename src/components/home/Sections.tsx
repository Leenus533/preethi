import Link from "next/link";
import { SERVICES, SITE, formatPrice } from "@/lib/config";
import { Icon } from "@/components/ui/icons";
import { TutorPortrait } from "./TutorPortrait";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-gradient-to-b from-pine-50 to-transparent" aria-hidden />
      <div className="container-x grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="fade-up">
          <p className="eyebrow">Online tutoring · Norwich and across the UK</p>
          <h1 className="font-display mt-4 text-4xl leading-[1.08] text-pine-900 sm:text-5xl lg:text-[3.6rem]">
            Science, maths and medicine tutoring that makes the hard parts click.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            I&rsquo;m Preethi, a final-year medical student at the University of East Anglia. I help GCSE and A-level students turn
            &ldquo;I don&rsquo;t get it&rdquo; into confident exam answers, and I coach future medics through the UCAT and their applications.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/book?service=intro-call" className="btn btn-primary">
              Book a free intro call <Icon.Arrow width={18} height={18} />
            </Link>
            <Link href="/#pricing" className="btn btn-secondary">
              See subjects and prices
            </Link>
          </div>
          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-cream-200 pt-6">
            {[
              ["A, A, A", "A-level Biology, Chemistry, Maths"],
              ["Top 10%", "UCAT score"],
              ["Grade 9", "GCSE Biology, Chemistry, Physics"],
            ].map(([big, small]) => (
              <div key={big}>
                <dt className="font-display text-2xl text-pine-800 sm:text-3xl">{big}</dt>
                <dd className="mt-1 text-xs leading-snug text-muted sm:text-sm">{small}</dd>
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
  { icon: Icon.Cap, text: "Final-year Medicine MBBS, University of East Anglia" },
  { icon: Icon.Shield, text: "Enhanced DBS check held through UEA Medical School" },
  { icon: Icon.Heart, text: "Sixth-form subject mentor for a full academic year" },
  { icon: Icon.Video, text: "Online via Google Meet, with a calendar invite sent automatically" },
];

export function TrustStrip() {
  return (
    <section aria-label="Credentials" className="border-y border-cream-200 bg-white">
      <ul className="container-x grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {trust.map(({ icon: I, text }) => (
          <li key={text} className="flex items-start gap-3 text-sm text-ink-soft">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pine-50 text-pine-700">
              <I width={17} height={17} />
            </span>
            <span>{text}</span>
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
    chips: ["Maths", "Biology", "Chemistry", "Physics", "Combined Science"],
    serviceId: "gcse-60",
  },
  {
    title: "A-level",
    blurb: "Topic-by-topic depth, plus the exam technique that separates a B from an A.",
    chips: ["Biology", "Chemistry", "Maths"],
    serviceId: "alevel-60",
  },
  {
    title: "UCAT",
    blurb: "Strategy and timing for every section, from someone who scored in the top 10%.",
    chips: ["Verbal Reasoning", "Decision Making", "Quantitative", "Situational Judgement"],
    serviceId: "ucat-60",
  },
  {
    title: "Medical school applications",
    blurb: "Personal statement reviews, mock interviews and honest advice on where to apply.",
    chips: ["Personal statement", "MMI practice", "Panel interviews", "UCAS strategy"],
    serviceId: "medicine-60",
  },
];

export function Subjects() {
  return (
    <section id="subjects" className="container-x scroll-mt-24 py-20">
      <div className="max-w-2xl">
        <p className="eyebrow">What I teach</p>
        <h2 className="font-display mt-3 text-3xl text-pine-900 sm:text-4xl">Subjects and stages</h2>
        <p className="mt-4 text-ink-soft">
          Every session is one-to-one and tailored to the student&rsquo;s exam board and target grade. AQA, Edexcel and OCR all covered.
        </p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {subjects.map((s) => (
          <article key={s.title} className="card flex flex-col p-6 sm:p-7">
            <h3 className="font-display text-2xl text-pine-900">{s.title}</h3>
            <p className="mt-2 text-ink-soft">{s.blurb}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {s.chips.map((c) => (
                <li key={c} className="rounded-full bg-pine-50 px-3 py-1 text-xs font-medium text-pine-800">
                  {c}
                </li>
              ))}
            </ul>
            <Link href={`/book?service=${s.serviceId}`} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-pine-700 hover:text-pine-900">
              Book {s.title} tutoring <Icon.Arrow width={16} height={16} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

const steps = [
  {
    icon: Icon.Mail,
    title: "Start with a free intro call",
    text: "Twenty minutes to talk about goals, exam boards and how sessions would work. No pressure, nothing to pay.",
  },
  {
    icon: Icon.Calendar,
    title: "Pick a time that suits",
    text: "The booking calendar shows live availability. Choose a slot, add a few details and you are done.",
  },
  {
    icon: Icon.Card,
    title: "Pay securely, get your invite",
    text: "Card payment through Stripe. A Google Calendar invitation with the Meet link lands in your inbox straight away.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-pine-900 py-20 text-white">
      <div className="container-x">
        <p className="eyebrow !text-pine-200">How it works</p>
        <h2 className="font-display mt-3 max-w-xl text-3xl sm:text-4xl">Three steps from first message to first session</h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map(({ icon: I, title, text }, i) => (
            <li key={title} className="relative rounded-3xl border border-white/10 bg-white/5 p-6">
              <span className="absolute -top-3 left-6 rounded-full bg-clay-700 px-3 py-1 text-xs font-bold text-white">{i + 1}</span>
              <I width={26} height={26} className="text-pine-200" />
              <h3 className="mt-4 font-display text-xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-pine-100">{text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <Link href="/book" className="btn btn-accent">
            Book a session
          </Link>
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="container-x scroll-mt-24 py-20">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow">About Preethi</p>
          <h2 className="font-display mt-3 text-3xl text-pine-900 sm:text-4xl">A tutor who knows the current specifications, and remembers what was hard</h2>
        </div>
        <div className="space-y-5 text-ink-soft leading-relaxed">
          <p>
            I went to school in Norwich, took Biology, Chemistry and Maths at Sir Isaac Newton Sixth Form and got an A in each. Before that I
            picked up grade 9s in GCSE Biology, Chemistry, Physics, Computer Science and Geography. I scored in the top 10% on the UCAT and
            started Medicine at the University of East Anglia in 2022. I&rsquo;m now in my final year.
          </p>
          <p>
            After my A-levels I spent a year as a student subject mentor at my old sixth form, running one-to-one and group sessions, online
            and in person, and reporting back to teachers on progress. That is where I learned that most &ldquo;I&rsquo;m just bad at
            chemistry&rdquo; problems are really one or two missing ideas plus a lack of exam practice, and both are fixable.
          </p>
          <p>
            Alongside my degree I work front-of-house in a private physiotherapy clinic and have spent more than eight years in patient-facing
            roles, so I&rsquo;m used to explaining complicated things calmly to people of all ages. I hold an Enhanced DBS check through the
            medical school, and parents are always welcome to sit in on sessions.
          </p>
          <ul className="grid gap-3 pt-2 sm:grid-cols-2">
            {[
              "Sessions planned around your exam board and specification",
              "Clear notes on what to practise before the next session",
              "Exam-style questions worked through together",
              "Honest, current advice on medicine applications",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm">
                <Icon.Check width={18} height={18} className="mt-0.5 shrink-0 text-pine-600" />
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
  return (
    <section id="pricing" className="scroll-mt-24 bg-cream-100 py-20">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow">Prices</p>
          <h2 className="font-display mt-3 text-3xl text-pine-900 sm:text-4xl">Simple pricing, pay as you go</h2>
          <p className="mt-4 text-ink-soft">
            No packages, no minimum commitment. Pay per session by card when you book. Reschedule free with {SITE.cancellationNoticeHours} hours&rsquo;
            notice.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <article key={s.id} className={`card relative flex flex-col p-6 ${s.badge ? "ring-2 ring-pine-500" : ""}`}>
              {s.badge && (
                <span className="absolute -top-3 left-6 rounded-full bg-pine-700 px-3 py-1 text-xs font-semibold text-white">{s.badge}</span>
              )}
              <h3 className="font-display text-xl text-pine-900">{s.name}</h3>
              <p className="mt-1 text-sm text-muted">{s.tagline}</p>
              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="font-display text-4xl text-pine-800">{formatPrice(s.pricePence)}</span>
                <span className="text-sm text-muted">/ {s.durationMinutes} min</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-ink-soft">
                {s.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <Icon.Check width={16} height={16} className="mt-0.5 shrink-0 text-pine-600" />
                    {h}
                  </li>
                ))}
              </ul>
              <Link href={`/book?service=${s.id}`} className={`btn mt-6 w-full ${s.pricePence === 0 ? "btn-secondary" : "btn-primary"}`}>
                {s.pricePence === 0 ? "Book free call" : "Book and pay"}
              </Link>
            </article>
          ))}
        </div>
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
    <section id="faq" className="container-x scroll-mt-24 py-20">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 className="font-display mt-3 text-3xl text-pine-900 sm:text-4xl">Frequently asked</h2>
          <p className="mt-4 text-ink-soft">
            Anything else? Email{" "}
            <a href={`mailto:${SITE.contactEmail}`} className="font-medium text-pine-800 underline underline-offset-4">
              {SITE.contactEmail}
            </a>
            .
          </p>
        </div>
        <div className="divide-y divide-cream-200 rounded-3xl border border-cream-200 bg-white px-6">
          {faqs.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-pine-900">
                {f.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cream-100 text-pine-700 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="container-x">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pine-700 to-pine-900 px-8 py-14 text-white sm:px-14">
        <Icon.Sparkle width={120} height={120} className="absolute -right-6 -top-6 text-white/10" />
        <p className="eyebrow !text-pine-200">Ready when you are</p>
        <h2 className="font-display mt-3 max-w-lg text-3xl sm:text-4xl">Start with a free 20-minute intro call</h2>
        <p className="mt-3 max-w-lg text-pine-100">Pick a time on the live calendar. If it turns out I&rsquo;m not the right fit, you&rsquo;ve lost nothing.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/book?service=intro-call" className="btn btn-accent">
            Book the free call
          </Link>
          <Link href="/book" className="btn border border-white/30 text-white hover:bg-white/10">
            Book a paid session
          </Link>
        </div>
      </div>
    </section>
  );
}
