import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE, formatPrice } from "@/lib/config";
import { SUBJECTS, getSubject, subjectBookingHref, subjectPath, subjectService } from "@/lib/subjects";
import { breadcrumbs, faqPage, graph, subjectServiceSchema, webPage } from "@/lib/seo";
import { CtaBand, FaqList, SectionHead } from "@/components/home/Sections";
import { JsonLd } from "@/components/JsonLd";
import { Icon } from "@/components/ui/icons";
import { MOTIF } from "@/components/ui/motif";

export const dynamicParams = false;

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tutoring/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const subject = getSubject(slug);
  if (!subject) return {};
  const path = subjectPath(subject);
  return {
    title: { absolute: subject.metaTitle },
    description: subject.metaDescription,
    keywords: subject.keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: subject.metaTitle,
      description: subject.metaDescription,
      siteName: SITE.name,
      locale: "en_GB",
    },
    twitter: { card: "summary_large_image", title: subject.metaTitle, description: subject.metaDescription },
  };
}

export default async function SubjectPage({ params }: PageProps<"/tutoring/[slug]">) {
  const { slug } = await params;
  const subject = getSubject(slug);
  if (!subject) notFound();

  const service = subjectService(subject);
  const M = MOTIF[subject.motif];
  const others = SUBJECTS.filter((s) => s.slug !== subject.slug);
  const path = subjectPath(subject);

  return (
    <>
      {/* Hero */}
      <section aria-labelledby="subject-title" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="bg-dots mask-fade absolute inset-x-0 top-0 h-[36rem]" />
          <div className="absolute -right-40 -top-56 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgb(174_214_204/0.5),transparent)]" />
        </div>
        <div className="container-x relative pb-14 pt-8 sm:pt-10 lg:pb-20">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="focus-ring rounded-sm hover:text-pine-900 hover:underline underline-offset-4">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/#subjects" className="focus-ring rounded-sm hover:text-pine-900 hover:underline underline-offset-4">
                  Subjects
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-ink-soft">
                {subject.title}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
            <div>
              <p className="running-head">{subject.title} tutoring</p>
              <h1
                id="subject-title"
                className="font-display font-display-xl mt-4 max-w-[18ch] text-[length:var(--text-display)] leading-[1.04] text-balance text-pine-900"
              >
                {subject.heading}
              </h1>
              <p className="mt-6 max-w-[var(--measure)] text-[length:var(--text-lead)] leading-relaxed text-ink-soft">{subject.lead}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={subjectBookingHref(subject)} className="btn btn-primary">
                  Book a {service.durationMinutes}-minute session, {formatPrice(service.pricePence)} <Icon.Arrow width={18} height={18} aria-hidden />
                </Link>
                <Link href="/book?service=intro-call" className="btn btn-secondary">
                  Free intro call first
                </Link>
              </div>
            </div>

            <aside aria-label="Session details" className="card rise overflow-hidden">
              <div className="flex items-center gap-4 border-b border-cream-200 bg-cream-50 p-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-pine-700 text-white shadow-[var(--shadow-soft)]">
                  <M width={24} height={24} aria-hidden />
                </span>
                <div>
                  <p className="font-display text-lg leading-tight text-pine-900">{service.name}</p>
                  <p className="text-sm text-muted">{service.tagline}</p>
                </div>
              </div>
              <dl className="divide-y divide-cream-200 px-5">
                {[
                  ["Price", `${formatPrice(service.pricePence)} per ${service.durationMinutes} minutes`],
                  ["Format", "One-to-one, online over Google Meet"],
                  ["Availability", "Weekday evenings and weekends, UK time"],
                  ["Booking", "Live calendar, pay by card, invite sent instantly"],
                  ["Cancellation", `Free with ${SITE.cancellationNoticeHours} hours' notice`],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 py-3 text-sm">
                    <dt className="font-medium text-muted">{k}</dt>
                    <dd className="text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <ul className="grid gap-2 border-t border-cream-200 bg-cream-50 p-5 text-sm text-ink-soft">
                {service.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <Icon.Check width={16} height={16} strokeWidth={2.2} className="mt-0.5 shrink-0 text-pine-600" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* What sessions cover */}
      <section aria-labelledby="covers-title" className="section bg-cream-100/60">
        <div className="container-x section-grid">
          <SectionHead head="What we work on" id="covers-title" title="What sessions cover" />
          <ol className="grid gap-5 md:grid-cols-2">
            {subject.covers.map((c, i) => (
              <li key={c.title} className="card p-6 sm:p-7">
                <span className="font-display text-[2rem] leading-none text-clay-600">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display mt-3 text-[length:var(--text-h3)] text-pine-900">{c.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{c.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Who it suits and the approach */}
      <section aria-labelledby="who-title" className="section">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="section-grid !gap-8">
            <SectionHead head="Who it suits" id="who-title" title="Sessions are a good fit if" />
            <ul className="grid gap-3">
              {subject.whoFor.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[1.0625rem] text-ink-soft">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-pine-50 text-pine-700">
                    <Icon.Check width={14} height={14} strokeWidth={2.4} aria-hidden />
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="section-grid !gap-8">
            <SectionHead head="The approach" title="How I teach it" />
            <div className="measure grid gap-[var(--space-item)] leading-relaxed text-ink-soft">
              {subject.approach.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="card border-pine-200 bg-gradient-to-br from-pine-50 to-white p-6">
              <p className="running-head">Why Preethi</p>
              <ul className="mt-4 grid gap-2.5 text-[0.9375rem] text-ink-soft">
                {subject.credentials.map((c) => (
                  <li key={c} className="flex items-start gap-2.5">
                    <Icon.Cap width={18} height={18} className="mt-0.5 shrink-0 text-pine-700" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
              <Link href="/#about" className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-pine-800 hover:text-pine-900">
                More about Preethi <Icon.Arrow width={15} height={15} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="subject-faq-title" className="section">
        <div className="container-x grid gap-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SectionHead head="Questions" id="subject-faq-title" title={`${subject.title} questions`}>
              <p>
                Something else? Email{" "}
                <a href={`mailto:${SITE.contactEmail}`} className="focus-ring font-medium text-pine-700 underline underline-offset-4">
                  {SITE.contactEmail}
                </a>{" "}
                or book a free intro call.
              </p>
            </SectionHead>
          </div>
          <FaqList items={subject.faqs} />
        </div>
      </section>

      {/* Other subjects */}
      <section aria-labelledby="others-title" className="section">
        <div className="container-x section-grid !gap-8">
          <SectionHead head="Also available" id="others-title" title="Other subjects" />
          <ul className="grid gap-4 md:grid-cols-3">
            {others.map((s) => {
              const OM = MOTIF[s.motif];
              const sv = subjectService(s);
              return (
                <li key={s.slug}>
                  <Link href={subjectPath(s)} className="card card-hover focus-ring flex h-full items-start gap-4 p-5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-pine-50 text-pine-700">
                      <OM width={20} height={20} aria-hidden />
                    </span>
                    <span>
                      <span className="font-display block text-lg leading-tight text-pine-900">{s.title}</span>
                      <span className="mt-1 block text-sm text-muted">
                        {formatPrice(sv.pricePence)} / {sv.durationMinutes} min
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <CtaBand
        title="Not sure yet? Start with a free intro call"
        text={`Twenty minutes to talk through ${subject.title} goals, exam boards and how sessions would work. Nothing to pay.`}
      />

      <JsonLd
        data={graph(
          webPage(path, subject.metaTitle, subject.metaDescription),
          subjectServiceSchema(subject),
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Subjects", path: "/#subjects" },
            { name: subject.title, path },
          ]),
          faqPage(subject.faqs),
        )}
      />
    </>
  );
}
