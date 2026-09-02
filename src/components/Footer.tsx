import Link from "next/link";
import { SITE } from "@/lib/config";
import { SUBJECTS, subjectPath } from "@/lib/subjects";

const linkClass = "focus-ring rounded-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-cream-200">
      <div className="container-x grid gap-10 py-14 text-sm md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-[1.0625rem] font-semibold tracking-tight text-ink">Preethi Amudhan</p>
          <p className="mt-3 max-w-sm leading-relaxed text-ink-soft">
            One-to-one online tutoring in any GCSE or A-level subject, UCAT preparation and medical school applications, from a
            final-year medical student at the University of East Anglia.
          </p>
        </div>

        <nav aria-label="Subjects" className="md:col-span-2">
          <p className="mb-3 font-medium text-ink">Subjects</p>
          <ul className="space-y-2">
            {SUBJECTS.map((s) => (
              <li key={s.slug}>
                <Link href={subjectPath(s)} className={linkClass}>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Site" className="md:col-span-2">
          <p className="mb-3 font-medium text-ink">Site</p>
          <ul className="space-y-2">
            <li>
              <Link href="/#how-it-works" className={linkClass}>
                How it works
              </Link>
            </li>
            <li>
              <Link href="/#subjects" className={linkClass}>
                Prices
              </Link>
            </li>
            <li>
              <Link href="/book" className={linkClass}>
                Book a session
              </Link>
            </li>
            <li>
              <Link href="/terms" className={linkClass}>
                Terms and cancellation
              </Link>
            </li>
            <li>
              <Link href="/privacy" className={linkClass}>
                Privacy notice
              </Link>
            </li>
          </ul>
        </nav>

        <address className="not-italic md:col-span-3">
          <p className="mb-3 font-medium text-ink">Contact</p>
          <ul className="space-y-2 text-ink-soft">
            <li>
              <a href={`mailto:${SITE.contactEmail}`} className={`${linkClass} break-all`}>
                {SITE.contactEmail}
              </a>
            </li>
            {SITE.showPhone && (
              <li>
                <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`} className={linkClass}>
                  {SITE.phone}
                </a>
              </li>
            )}
            <li>{SITE.location}, sessions online via Google Meet</li>
            <li>Weekday evenings and weekends, UK time</li>
          </ul>
        </address>
      </div>

      <div className="border-t border-cream-200">
        <div className="container-x flex flex-col gap-2 py-5 text-[length:var(--text-meta)] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.tutorName}
          </p>
          <p>Payments by Stripe. Calendar invitations by Google.</p>
        </div>
      </div>
    </footer>
  );
}
