import Link from "next/link";
import { SERVICES, SITE, TIMEZONE, formatPrice } from "@/lib/config";
import { SUBJECTS, subjectBookingHref, subjectPath, subjectService } from "@/lib/subjects";
import { Icon } from "@/components/ui/icons";
import { NextSlots } from "./NextSlots";

/** Section header: sentence-case claim plus an optional one-paragraph lede. */
export function SectionHead({ title, id, children }: { title: React.ReactNode; id?: string; children?: React.ReactNode }) {
  return (
    <div className="grid gap-4">
      <h2 id={id} className="font-display font-display-lg max-w-[22ch] text-[length:var(--text-h2)] leading-[1.15] text-balance text-ink">
        {title}
      </h2>
      {children && <div className="measure text-[1.0625rem] leading-relaxed text-ink-soft">{children}</div>}
    </div>
  );
}

const results: [string, string, string][] = [
  ["A-level", "A, A, A", "Biology, Chemistry and Maths"],
  ["UCAT", "Top 10%", "Nationally"],
  ["GCSE", "Grade 9", "Biology, Chemistry and Physics"],
];

export function Hero() {
  const intro = SERVICES.find((s) => s.pricePence === 0);
  return (
    <section aria-labelledby="hero-title">
      <div className="container-x grid gap-12 pb-16 pt-12 lg:grid-cols-12 lg:gap-x-16 lg:pb-20 lg:pt-16">
        <div className="lg:col-span-7">
          <h1 id="hero-title" className="font-display font-display-xl max-w-[16ch] text-[length:var(--text-display)] leading-[1.05] text-balance text-ink">
            GCSE, A-level and medicine tutoring that makes the hard parts click.
          </h1>
          <p className="mt-6 max-w-[var(--measure-lead)] text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
            I&rsquo;m Preethi, a final-year medical student at the University of East Anglia, teaching online from Norwich. I help GCSE
            and A-level students in any subject turn &ldquo;I don&rsquo;t get it&rdquo; into confident exam answers, with maths and the
            sciences as my specialisms, and coach future medics through the UCAT and their applications.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/book?service=intro-call" className="btn btn-primary">
              Book a free intro call
            </Link>
            <Link href="/#subjects" className="btn btn-secondary">
              Subjects and prices
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-cream-200 pt-6">
            {results.map(([label, value, detail]) => (
              <div key={label} className="min-w-0">
                <dt className="text-[length:var(--text-meta)] text-muted">{label}</dt>
                <dd className="font-display mt-1 text-2xl leading-none tabular-nums text-ink sm:text-[1.75rem]">{value}</dd>
                <dd className="mt-1.5 text-sm leading-snug text-ink-soft">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5 lg:self-start lg:pt-2">
          <NextSlots serviceId={intro?.id ?? "intro-call"} timezone={TIMEZONE} />
        </div>
      </div>
    </section>
  );
}

const trust = [
  "Final-year Medicine MBBS, University of East Anglia",
  "Enhanced DBS check through UEA Medical School",
  "A full academic year as a sixth-form subject mentor",
  "Online over Google Meet, invitation sent automatically",
];

export function TrustStrip() {
  return (
    <section aria-label="Credentials" className="border-y border-cream-200">
      <ul className="container-x grid gap-x-8 gap-y-3 py-5 text-sm leading-snug text-ink-soft sm:grid-cols-2 lg:grid-cols-4">
        {trust.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    </section>
  );
}

type Row = { key: string; name: string; href?: string; covers: string; minutes: number; pricePence: number; bookHref: string };

function rows(): Row[] {
  const intro = SERVICES.find((s) => s.pricePence === 0);
  const list: Row[] = [];
  if (intro) {
    list.push({ key: intro.id, name: intro.name, covers: intro.tagline, minutes: intro.durationMinutes, pricePence: 0, bookHref: `/book?service=${intro.id}` });
  }
  for (const s of SUBJECTS) {
    const service = subjectService(s);
    list.push({
      key: s.slug,
      name: service.name,
      href: subjectPath(s),
      covers: s.detail,
      minutes: service.durationMinutes,
      pricePence: service.pricePence,
      bookHref: subjectBookingHref(s),
    });
  }
  return list;
}

/** Subjects and prices share one table: the same four sessions should not be listed twice. */
export function Subjects() {
  const data = rows();
  const paid = data.filter((r) => r.pricePence > 0);
  const cheapest = Math.min(...paid.map((r) => r.pricePence));
  return (
    <section id="subjects" aria-labelledby="subjects-title" className="section scroll-mt-20">
      <div className="container-x grid gap-10">
        <SectionHead
          id="subjects-title"
          title={
            <>
              Any subject at GCSE or <span className="whitespace-nowrap">A-level</span>, from {formatPrice(cheapest)} an hour
            </>
          }
        >
          <p>
            Plus UCAT preparation and medical school application coaching. Every session is one-to-one and planned around the
            student&rsquo;s exam board and target grade. Maths and the sciences are Preethi&rsquo;s specialisms. Choose a level to read
            what sessions cover.
          </p>
        </SectionHead>

        <div id="pricing" className="scroll-mt-20">
          <table className="table hidden md:table">
            <caption className="sr-only">Sessions, what they cover, length and price</caption>
            <thead>
              <tr>
                <th scope="col">Session</th>
                <th scope="col">What it covers</th>
                <th scope="col" className="numeric">
                  Length
                </th>
                <th scope="col" className="numeric">
                  Price
                </th>
                <th scope="col">
                  <span className="sr-only">Book</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.key}>
                  <th scope="row" className="font-medium text-ink">
                    {r.href ? (
                      <Link href={r.href} className="link">
                        {r.name}
                      </Link>
                    ) : (
                      r.name
                    )}
                  </th>
                  <td className="text-ink-soft">{r.covers}</td>
                  <td className="numeric whitespace-nowrap text-ink-soft">{r.minutes} min</td>
                  <td className="numeric whitespace-nowrap font-medium text-ink">{formatPrice(r.pricePence)}</td>
                  <td className="whitespace-nowrap text-right">
                    <Link href={r.bookHref} className="link font-medium">
                      Book
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="rows md:hidden">
            {data.map((r) => (
              <li key={r.key} className="grid gap-1 py-4">
                <div className="flex items-baseline justify-between gap-4">
                  {r.href ? (
                    <Link href={r.href} className="link font-medium text-ink">
                      {r.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-ink">{r.name}</span>
                  )}
                  <span className="whitespace-nowrap tabular-nums text-ink">
                    {formatPrice(r.pricePence)} <span className="text-muted">/ {r.minutes} min</span>
                  </span>
                </div>
                <p className="text-sm text-ink-soft">{r.covers}</p>
                <Link href={r.bookHref} className="link mt-1 text-sm font-medium">
                  Book
                </Link>
              </li>
            ))}
          </ul>

          <p className="measure mt-5 text-sm leading-relaxed text-muted">
            Prices are per session and include everything. No packages, no minimum commitment. Reschedule free with{" "}
            {SITE.cancellationNoticeHours} hours&rsquo; notice. Card payment through Stripe; the calendar invitation with the Google Meet
            link arrives as soon as you pay.
          </p>
        </div>
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
    <section id="how-it-works" aria-labelledby="how-title" className="section scroll-mt-20">
      <div className="container-x split">
        <SectionHead id="how-title" title="Three steps from first message to first session" />
        <ol className="rows md:grid md:grid-cols-3 md:gap-x-8 md:[&>*]:border-b md:[&>*]:border-cream-200">
          {steps.map((s, i) => (
            <li key={s.title} className="py-5">
              <h3 className="font-display grid grid-cols-[1.5rem_minmax(0,1fr)] text-[length:var(--text-h3)] leading-snug text-ink">
                <span className="font-normal tabular-nums text-muted" aria-hidden>
                  {i + 1}
                </span>
                <span>
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </span>
              </h3>
              <p className="mt-2 pl-6 leading-relaxed text-ink-soft">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const facts: [string, string][] = [
  ["Studying", "Medicine MBBS, University of East Anglia, final year"],
  ["A-levels", "Biology A, Chemistry A, Maths A, Sir Isaac Newton Sixth Form"],
  ["GCSEs", "Grade 9 in Biology, Chemistry, Physics, Computer Science and Geography"],
  ["UCAT", "Top 10% nationally"],
  ["Experience", "A year as a sixth-form subject mentor; eight years in patient-facing roles"],
  ["Safeguarding", "Enhanced DBS check through UEA Medical School"],
  ["Based in", "Norwich, teaching online across the UK"],
];

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="section scroll-mt-20">
      <div className="container-x split">
        <SectionHead id="about-title" title="A tutor who knows the current specifications, and remembers what was hard" />
        <div className="grid gap-8">
          <div className="measure grid gap-[var(--space-item)] leading-relaxed text-ink-soft">
            <p>
              I went to school in Norwich and took Biology, Chemistry and Maths at sixth form before starting Medicine at the University
              of East Anglia in 2022. I&rsquo;m now in my final year, which means I sat the exams I teach recently and use the science
              every week on placement.
            </p>
            <p>
              After my A-levels I spent a year as a student subject mentor at my old sixth form, running one-to-one and group sessions,
              online and in person, and reporting back to teachers on progress. That is where I learned that most &ldquo;I&rsquo;m just
              bad at chemistry&rdquo; problems are really one or two missing ideas plus a lack of exam practice. Both are fixable.
            </p>
            <p>
              Alongside my degree I work front-of-house in a private physiotherapy clinic and have spent more than eight years in
              patient-facing roles, so I&rsquo;m used to explaining complicated things calmly to people of all ages. I hold an Enhanced
              DBS check through the medical school, and parents are always welcome to sit in on sessions.
            </p>
          </div>
          <dl className="rows text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 py-3">
                <dt className="text-muted">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
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
    <div className="rows">
      {items.map((f) => (
        <details key={f.q} className="group">
          <summary className="focus-ring flex cursor-pointer list-none items-baseline justify-between gap-6 py-4 text-left font-medium text-ink [&::-webkit-details-marker]:hidden">
            {f.q}
            <Icon.Chevron width={16} height={16} className="mt-1 shrink-0 self-start text-muted transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className="measure pb-5 leading-relaxed text-ink-soft">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="section scroll-mt-20">
      <div className="container-x split">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionHead id="faq-title" title="Questions parents ask before booking">
            <p>
              Anything else? Email{" "}
              <a href={`mailto:${SITE.contactEmail}`} className="link font-medium">
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

export function CtaBand({ title, text }: { title?: string; text?: string } = {}) {
  return (
    <section aria-labelledby="cta-title" className="section !border-t-0 !pt-0">
      <div className="container-x">
        <div className="surface-dark grid gap-8 rounded-xl px-6 py-12 sm:px-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h2 id="cta-title" className="font-display font-display-lg max-w-[20ch] text-[length:var(--text-h2)] leading-[1.15] text-balance">
              {title ?? "Start with a free 20-minute intro call"}
            </h2>
            <p className="measure mt-4 text-[1.0625rem] leading-relaxed text-pine-100">
              {text ?? "Pick a time on the live calendar. If it turns out I\u2019m not the right fit, you\u2019ve lost nothing."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <Link href="/book?service=intro-call" className="btn btn-invert">
              Book the free call
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
