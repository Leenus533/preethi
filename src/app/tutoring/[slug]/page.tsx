import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE, formatPrice } from "@/lib/config";
import { SUBJECTS, getSubject, subjectBookingHref, subjectPath, subjectService } from "@/lib/subjects";
import { breadcrumbs, faqPage, graph, subjectServiceSchema, webPage } from "@/lib/seo";
import { CtaBand, FaqList, SectionHead } from "@/components/home/Sections";
import { JsonLd } from "@/components/JsonLd";

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
  const others = SUBJECTS.filter((s) => s.slug !== subject.slug);
  const path = subjectPath(subject);

  const details: [string, string][] = [
    ["Price", `${formatPrice(service.pricePence)} per ${service.durationMinutes} minutes`],
    ["Format", "One-to-one, online over Google Meet"],
    ["Availability", "Weekday evenings and weekends, UK time"],
    ["Booking", "Live calendar, pay by card, invitation sent at once"],
    ["Cancellation", `Free with ${SITE.cancellationNoticeHours} hours' notice`],
  ];

  return (
    <>
      <section aria-labelledby="subject-title">
        <div className="container-x pb-14 pt-8 lg:pb-20 lg:pt-10">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="focus-ring rounded-sm hover:text-ink hover:underline underline-offset-4">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/#subjects" className="focus-ring rounded-sm hover:text-ink hover:underline underline-offset-4">
                  Subjects
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-ink-soft">
                {subject.title}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-x-16">
            <div className="lg:col-span-7">
              <h1 id="subject-title" className="font-display font-display-xl max-w-[18ch] text-[length:var(--text-display)] leading-[1.05] text-balance text-ink">
                {subject.heading}
              </h1>
              <p className="mt-6 max-w-[var(--measure)] text-[length:var(--text-lead)] leading-relaxed text-ink-soft">{subject.lead}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={subjectBookingHref(subject)} className="btn btn-primary">
                  Book a {service.durationMinutes}-minute session, {formatPrice(service.pricePence)}
                </Link>
                <Link href="/book?service=intro-call" className="btn btn-secondary">
                  Free intro call first
                </Link>
              </div>
            </div>

            <aside aria-label="Session details" className="lg:col-span-5 lg:pt-2">
              <dl className="rows text-sm">
                {details.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 py-3">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-4 grid gap-1.5 text-sm text-ink-soft">
                {service.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section aria-labelledby="covers-title" className="section">
        <div className="container-x split">
          <SectionHead id="covers-title" title="What sessions cover" />
          <div className="rows md:grid md:grid-cols-2 md:gap-x-8 md:[&>*]:border-b md:[&>*]:border-cream-200">
            {subject.covers.map((c) => (
              <div key={c.title} className="py-5">
                <h3 className="font-display text-[length:var(--text-h3)] leading-snug text-ink">{c.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="who-title" className="section">
        <div className="container-x split">
          <SectionHead id="who-title" title="Who it suits, and how I teach it" />
          <div className="grid gap-8">
            <ul className="rows text-[1.0625rem] text-ink-soft">
              {subject.whoFor.map((t) => (
                <li key={t} className="py-3">
                  {t}
                </li>
              ))}
            </ul>
            <div className="measure grid gap-[var(--space-item)] leading-relaxed text-ink-soft">
              {subject.approach.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-medium text-ink">Why Preethi</h3>
              <ul className="mt-2 grid gap-1.5 text-[0.9375rem] text-ink-soft">
                {subject.credentials.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <Link href="/#about" className="link mt-3 inline-block text-sm font-medium">
                More about Preethi
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="subject-faq-title" className="section">
        <div className="container-x split">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SectionHead id="subject-faq-title" title={`${subject.title} questions`}>
              <p>
                Something else? Email{" "}
                <a href={`mailto:${SITE.contactEmail}`} className="link font-medium">
                  {SITE.contactEmail}
                </a>{" "}
                or book a free intro call.
              </p>
            </SectionHead>
          </div>
          <FaqList items={subject.faqs} />
        </div>
      </section>

      <section aria-labelledby="others-title" className="section">
        <div className="container-x split">
          <SectionHead id="others-title" title="Other subjects" />
          <ul className="rows">
            {others.map((s) => {
              const sv = subjectService(s);
              return (
                <li key={s.slug}>
                  <Link href={subjectPath(s)} className="focus-ring group flex items-baseline justify-between gap-6 py-4">
                    <span className="font-medium text-ink group-hover:underline underline-offset-4">{sv.name}</span>
                    <span className="whitespace-nowrap text-sm tabular-nums text-muted">
                      {formatPrice(sv.pricePence)} / {sv.durationMinutes} min
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
