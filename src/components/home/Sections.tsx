import Link from "next/link";
import { SERVICES, SITE, formatPrice } from "@/lib/config";
import { SUBJECTS, subjectBookingHref, subjectPath, subjectService } from "@/lib/subjects";
import { Icon } from "@/components/ui/icons";
import { MOTIF } from "@/components/ui/motif";
import { HeroVisual } from "./HeroVisual";

/** Section header: running head, claim, optional lead. */
export function SectionHead({
  head,
  title,
  id,
  align = "left",
  children,
}: {
  head: string;
  title: React.ReactNode;
  id?: string;
  align?: "left" | "center";
  children?: React.ReactNode;
}) {
  const centered = align === "center";
  return (
    <div className={`grid gap-4 ${centered ? "justify-items-center text-center" : ""}`}>
      <p className="running-head">{head}</p>
      <h2 id={id} className="font-display font-display-lg max-w-[24ch] text-[length:var(--text-h2)] leading-[1.1] text-balance text-pine-900">
        {title}
      </h2>
      {children && <div className={`measure text-[1.0625rem] leading-relaxed text-ink-soft ${centered ? "mx-auto" : ""}`}>{children}</div>}
    </div>
  );
}

export function Hero() {
  return (
    <section aria-labelledby="hero-title">
      <div className="container-x grid items-center gap-12 pb-16 pt-12 md:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pb-24 lg:pt-20">
        <div>
          <p className="chip">
            <Icon.Pin width={14} height={14} aria-hidden />
            Online tutoring from Norwich, for students anywhere in the UK
          </p>
          <h1
            id="hero-title"
            className="font-display font-display-xl mt-6 text-[length:var(--text-display)] leading-[1.02] text-balance text-pine-900"
          >
            GCSE, A-level and medicine tutoring that makes the hard parts click.
          </h1>
          <p className="mt-6 max-w-[var(--measure-lead)] text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
            I&rsquo;m Preethi, a final-year medical student at the University of East Anglia. I help GCSE and A-level students in
            any subject turn &ldquo;I don&rsquo;t get it&rdquo; into confident exam answers, with maths and the sciences as my
            specialisms, and coach future medics through the UCAT and their applications.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/book?service=intro-call" className="btn btn-primary">
              Book a free intro call <Icon.Arrow width={18} height={18} aria-hidden />
            </Link>
            <Link href="/#pricing" className="btn btn-secondary">
              See subjects and prices
            </Link>
          </div>
          <dl className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-cream-300 border-t border-cream-300 pt-6">
            {[
              ["A, A, A", "A-level Biology, Chemistry, Maths"],
              ["Top 10%", "UCAT score"],
              ["Grade 9", "GCSE Biology, Chemistry, Physics"],
            ].map(([big, small], i) => (
              <div key={big} className={i === 0 ? "pr-3 sm:pr-4" : "px-3 sm:px-4"}>
                <dt className="font-display whitespace-nowrap text-[1.35rem] text-pine-800 sm:text-3xl">{big}</dt>
                <dd className="mt-1 text-[length:var(--text-meta)] leading-snug text-muted">{small}</dd>
              </div>
            ))}
          </dl>
        </div>
        <HeroVisual className="mx-auto w-full max-w-md lg:max-w-none" />
      </div>
    </section>
  );
}

const trust = [
  { icon: Icon.Cap, text: "Final-year Medicine MBBS, University of East Anglia" },
  { icon: Icon.Shield, text: "Enhanced DBS check held through UEA Medical School" },
  { icon: Icon.Users, text: "A full academic year as a sixth-form subject mentor" },
  { icon: Icon.Video, text: "Online over Google Meet, calendar invite sent automatically" },
];

export function TrustStrip() {
  return (
    <section aria-label="Credentials" className="border-y border-cream-200 bg-cream-100/70">
      <ul className="container-x grid gap-x-8 gap-y-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {trust.map(({ icon: I, text }) => (
          <li key={text} className="flex items-start gap-3 text-[0.9375rem] leading-snug text-ink-soft">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-pine-700 shadow-[var(--shadow-soft)] ring-1 ring-cream-300">
              <I width={17} height={17} aria-hidden />
            </span>
            <span className="pt-1">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Subjects() {
  return (
    <section id="subjects" aria-labelledby="subjects-title" className="section scroll-mt-24">
      <div className="container-x section-grid">
        <SectionHead head="Subjects" id="subjects-title" title="One-to-one, built around your exam board">
          <p>
            Any GCSE or A-level subject, plus UCAT and medical school applications. Every session is planned around the student&rsquo;s
            specification and target grade. Pick a level to see exactly what sessions cover.
          </p>
        </SectionHead>
        <ul className="grid gap-5 md:grid-cols-2">
          {SUBJECTS.map((s) => {
            const M = MOTIF[s.motif];
            const service = subjectService(s);
            return (
              <li key={s.slug} className="card card-hover flex flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-pine-50 text-pine-700 ring-1 ring-pine-100">
                    <M width={24} height={24} aria-hidden />
                  </span>
                  <span className="chip">
                    {formatPrice(service.pricePence)} / {service.durationMinutes} min
                  </span>
                </div>
                <h3 className="font-display mt-5 text-[1.5rem] leading-tight text-pine-900">
                  <Link href={subjectPath(s)} className="focus-ring rounded-sm underline-offset-4 hover:underline">
                    {s.title}
                  </Link>
                </h3>
                <p className="mt-2 text-ink-soft">{s.blurb}</p>
                <p className="mt-1.5 text-[length:var(--text-meta)] text-muted">{s.detail}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-cream-200 pt-5 text-sm font-semibold">
                  <Link href={subjectPath(s)} className="focus-ring inline-flex items-center gap-1.5 rounded-sm text-pine-800 hover:text-pine-900">
                    What sessions cover <Icon.Arrow width={15} height={15} aria-hidden />
                  </Link>
                  <Link href={subjectBookingHref(s)} className="focus-ring rounded-sm text-pine-700 underline underline-offset-4 hover:text-pine-900">
                    Book a session
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

const steps = [
  {
    title: "Start with a free intro call",
    text: "Twenty minutes to talk about goals, exam boards and how sessions would work. No pressure, nothing to pay.",
    icon: Icon.Users,
  },
  {
    title: "Pick a time that suits",
    text: "The booking calendar shows live availability. Choose a slot, add a few details and you are done.",
    icon: Icon.Calendar,
  },
  {
    title: "Pay securely, get your invite",
    text: "Card payment through Stripe. A Google Calendar invitation with the Meet link lands in your inbox straight away.",
    icon: Icon.Video,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="section scroll-mt-24 bg-cream-100/60">
      <div className="container-x section-grid">
        <SectionHead head="How it works" id="how-title" title="Three steps from first message to first session" align="center" />
        <ol className="relative grid gap-6 md:grid-cols-3 md:gap-8">
          <span aria-hidden className="absolute left-[16.6%] right-[16.6%] top-9 hidden border-t-2 border-dashed border-pine-200 md:block" />
          {steps.map((s, i) => {
            const I = s.icon;
            return (
              <li key={s.title} className="card relative flex flex-col items-center p-7 text-center">
                <span className="relative grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-pine-700 text-white shadow-[var(--shadow-soft)]">
                  <I width={28} height={28} aria-hidden />
                  <span className="font-display absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-clay-100 text-[0.95rem] text-clay-700 ring-2 ring-white">
                    {i + 1}
                  </span>
                </span>
                <h3 className="font-display mt-6 text-[length:var(--text-h3)] text-pine-900">{s.title}</h3>
                <p className="mt-2 max-w-[30ch] leading-relaxed text-ink-soft">{s.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

const facts: [string, string][] = [
  ["Studying", "Medicine MBBS, University of East Anglia, final year"],
  ["A-levels", "Biology A, Chemistry A, Maths A"],
  ["GCSEs", "Grade 9 in Biology, Chemistry, Physics, Computer Science and Geography"],
  ["UCAT", "Top 10% nationally"],
  ["Experience", "A year as a sixth-form subject mentor; 8+ years in patient-facing roles"],
  ["Safeguarding", "Enhanced DBS check through UEA Medical School"],
  ["Based in", "Norwich, teaching online across the UK"],
];

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="section scroll-mt-24">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <div className="section-grid !gap-8">
          <SectionHead head="About Preethi" id="about-title" title="A tutor who knows the current specifications, and remembers what was hard" />
          <div className="measure grid gap-[var(--space-item)] leading-relaxed text-ink-soft">
            <p>
              I went to school in Norwich, took Biology, Chemistry and Maths at Sir Isaac Newton Sixth Form and got an A in each.
              Before that I picked up grade 9s in GCSE Biology, Chemistry, Physics, Computer Science and Geography. I scored in the
              top 10% on the UCAT and started Medicine at the University of East Anglia in 2022. I&rsquo;m now in my final year.
            </p>
            <blockquote className="relative border-l-2 border-clay-600 pl-5">
              <p className="font-display text-[1.35rem] leading-snug text-pine-900">
                Most &ldquo;I&rsquo;m just bad at chemistry&rdquo; problems are really one or two missing ideas plus a lack of exam
                practice. Both are fixable.
              </p>
            </blockquote>
            <p>
              After my A-levels I spent a year as a student subject mentor at my old sixth form, running one-to-one and group
              sessions, online and in person, and reporting back to teachers on progress. That is where I learned how to find the
              missing idea quickly, and how to turn it into marks.
            </p>
            <p>
              Alongside my degree I work front-of-house in a private physiotherapy clinic and have spent more than eight years in
              patient-facing roles, so I&rsquo;m used to explaining complicated things calmly to people of all ages. I hold an
              Enhanced DBS check through the medical school, and parents are always welcome to sit in on sessions.
            </p>
          </div>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {[
              "Sessions planned around your exam board and specification",
              "Clear notes on what to practise before the next session",
              "Exam-style questions worked through together",
              "Honest, current advice on medicine applications",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[0.9375rem] text-ink-soft">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pine-50 text-pine-700">
                  <Icon.Check width={13} height={13} strokeWidth={2.4} aria-hidden />
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside aria-label="At a glance" className="card overflow-hidden self-start lg:sticky lg:top-24">
          <div className="surface-dark relative p-6">
            <p className="font-display font-display-xl text-[4rem] leading-none text-white/95">PA</p>
            <p className="font-display mt-4 text-xl">Preethi Amudhan</p>
            <p className="mt-1 text-sm text-pine-100">Final-year medical student and tutor</p>
          </div>
          <dl className="divide-y divide-cream-200 px-6">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3 py-3 text-sm">
                <dt className="font-medium text-muted">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-cream-200 bg-cream-50 p-5">
            <Link href="/book?service=intro-call" className="btn btn-primary w-full">
              Book a free intro call
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function Pricing() {
  const intro = SERVICES.find((s) => s.pricePence === 0);
  const paid = SERVICES.filter((s) => s.pricePence > 0);
  const cheapest = Math.min(...paid.map((s) => s.pricePence));
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="section scroll-mt-24">
      <div className="container-x section-grid">
        <SectionHead head="Prices" id="pricing-title" title={`From ${formatPrice(cheapest)} an hour, paid per session`} align="center">
          <p>
            No packages and no minimum commitment. Reschedule free with {SITE.cancellationNoticeHours} hours&rsquo; notice. Prices
            include everything: there are no booking fees.
          </p>
        </SectionHead>

        {intro && (
          <div className="card flex flex-col gap-5 border-pine-200 bg-pine-50/60 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-pine-700 shadow-[var(--shadow-soft)] ring-1 ring-pine-100">
                <Icon.Users width={24} height={24} aria-hidden />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-[length:var(--text-h3)] text-pine-900">{intro.name}</h3>
                  <span className="chip chip-clay">Free · {intro.durationMinutes} min</span>
                </div>
                <p className="mt-1 max-w-[52ch] text-[0.9375rem] text-ink-soft">{intro.tagline} {intro.description}</p>
              </div>
            </div>
            <Link href={`/book?service=${intro.id}`} className="btn btn-primary shrink-0">
              Book the free call <Icon.Arrow width={16} height={16} aria-hidden />
            </Link>
          </div>
        )}

        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {paid.map((s) => {
            const featured = Boolean(s.badge);
            return (
              <li key={s.id} className={`card flex flex-col p-6 ${featured ? "card-featured" : ""}`}>
                {featured && <span className="chip chip-clay absolute -top-3 left-6">{s.badge}</span>}
                <h3 className="font-display text-[1.25rem] leading-tight text-pine-900">{s.name}</h3>
                <p className="mt-1.5 min-h-[2.75rem] text-[0.9375rem] text-ink-soft">{s.tagline}</p>
                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-[2.5rem] leading-none tabular-nums text-ink">{formatPrice(s.pricePence)}</span>
                  <span className="text-sm text-muted">/ {s.durationMinutes} min</span>
                </p>
                <ul className="mt-5 grid gap-2 border-t border-cream-200 pt-5 text-sm text-ink-soft">
                  {s.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <Icon.Check width={16} height={16} strokeWidth={2.2} className="mt-0.5 shrink-0 text-pine-600" aria-hidden />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link href={`/book?service=${s.id}`} className={`btn mt-auto w-full pt-[0.85rem] ${featured ? "btn-primary" : "btn-secondary"}`}>
                  Book and pay
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export const HOME_FAQS = [
  {
    q: "Are sessions online or in person?",
    a: "Online by default, over Google Meet, so students anywhere in the UK can book. If you are in Norwich and would prefer in-person sessions, mention it on the intro call and we can see what works.",
  },
  {
    q: "Which subjects do you tutor?",
    a: "Any GCSE or A-level subject. Maths, Biology, Chemistry and Physics are the specialisms, where Preethi's own results are strongest, but if a student needs help in another subject just say so at booking or on the free intro call. UCAT preparation and medical school application coaching are separate sessions.",
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

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="grid gap-3">
      {items.map((f) => (
        <details key={f.q} className="card group open:border-pine-200">
          <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-[0.75rem] px-5 py-4 text-left font-medium text-pine-900 hover:bg-cream-50 [&::-webkit-details-marker]:hidden">
            {f.q}
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pine-50 text-pine-700 transition-transform group-open:rotate-180" aria-hidden>
              <Icon.Chevron width={16} height={16} />
            </span>
          </summary>
          <p className="measure px-5 pb-5 leading-relaxed text-ink-soft">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="section scroll-mt-24">
      <div className="container-x grid gap-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionHead head="Questions" id="faq-title" title="Questions parents ask before booking">
            <p>
              Anything else? Email{" "}
              <a href={`mailto:${SITE.contactEmail}`} className="focus-ring font-medium text-pine-700 underline underline-offset-4">
                {SITE.contactEmail}
              </a>
              .
            </p>
          </SectionHead>
        </div>
        <FaqList items={HOME_FAQS} />
      </div>
    </section>
  );
}

export function CtaBand({ title, text }: { title?: React.ReactNode; text?: string } = {}) {
  return (
    <section aria-labelledby="cta-title" className="section !border-t-0 !pt-0">
      <div className="container-x">
        <div className="surface-dark rounded-xl px-7 py-14 sm:px-14 sm:py-16">
          <p className="running-head !text-pine-200">Free to start</p>
          <h2 id="cta-title" className="font-display font-display-lg mt-4 max-w-[20ch] text-[length:var(--text-h2)] leading-[1.1] text-balance">
            {title ?? (
              <>
                Start with a free <span className="whitespace-nowrap">20-minute</span> intro call
              </>
            )}
          </h2>
          <p className="measure mt-4 text-[1.0625rem] text-pine-100">
            {text ?? "Pick a time on the live calendar. If it turns out I\u2019m not the right fit, you\u2019ve lost nothing."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book?service=intro-call" className="btn btn-invert">
              Book the free call <Icon.Arrow width={16} height={16} aria-hidden />
            </Link>
            <Link href="/book" className="btn btn-ghost-dark">
              Book a paid session
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
