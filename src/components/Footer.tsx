import Link from "next/link";
import { SITE } from "@/lib/config";
import { SUBJECTS, subjectPath } from "@/lib/subjects";
import { Icon } from "@/components/ui/icons";

const linkClass = "focus-ring rounded-sm text-pine-100 underline-offset-4 hover:text-white hover:underline";

export function Footer() {
  return (
    <footer className="surface-dark relative mt-auto overflow-hidden">
      <div className="bg-dots-dark mask-fade absolute inset-0" aria-hidden />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display font-display-lg text-[2rem] leading-none text-white">Preethi Amudhan</p>
          <p className="mt-1 text-sm font-medium tracking-wide text-pine-200">Tutoring</p>
          <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-pine-100">
            One-to-one online tutoring in GCSE and A-level science and maths, UCAT preparation and medical school applications,
            from a final-year medical student at the University of East Anglia.
          </p>
          <Link href="/book?service=intro-call" className="btn btn-invert mt-6">
            Book a free intro call <Icon.Arrow width={16} height={16} aria-hidden />
          </Link>
        </div>

        <nav aria-label="Subjects" className="text-sm">
          <p className="mb-4 font-semibold text-white">Subjects</p>
          <ul className="space-y-2.5">
            {SUBJECTS.map((s) => (
              <li key={s.slug}>
                <Link href={subjectPath(s)} className={linkClass}>
                  {s.title} tutoring
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Site" className="text-sm">
          <p className="mb-4 font-semibold text-white">Site</p>
          <ul className="space-y-2.5">
            <li>
              <Link href="/#how-it-works" className={linkClass}>
                How it works
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className={linkClass}>
                Prices
              </Link>
            </li>
            <li>
              <Link href="/#faq" className={linkClass}>
                Questions
              </Link>
            </li>
            <li>
              <Link href="/book" className={linkClass}>
                Book a session
              </Link>
            </li>
            <li>
              <Link href="/terms" className={linkClass}>
                Terms and cancellation policy
              </Link>
            </li>
            <li>
              <Link href="/privacy" className={linkClass}>
                Privacy notice
              </Link>
            </li>
          </ul>
        </nav>

        <address className="text-sm not-italic">
          <p className="mb-4 font-semibold text-white">Get in touch</p>
          <ul className="space-y-2.5 text-pine-100">
            <li className="flex items-start gap-2.5">
              <Icon.Mail width={16} height={16} className="mt-0.5 shrink-0 text-pine-300" aria-hidden />
              <a href={`mailto:${SITE.contactEmail}`} className={`${linkClass} break-all`}>
                {SITE.contactEmail}
              </a>
            </li>
            {SITE.showPhone && (
              <li className="flex items-start gap-2.5">
                <Icon.Card width={16} height={16} className="mt-0.5 shrink-0 text-pine-300" aria-hidden />
                <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`} className={linkClass}>
                  {SITE.phone}
                </a>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <Icon.Pin width={16} height={16} className="mt-0.5 shrink-0 text-pine-300" aria-hidden />
              <span>{SITE.location}, sessions online via Google Meet</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Icon.Clock width={16} height={16} className="mt-0.5 shrink-0 text-pine-300" aria-hidden />
              <span>Weekday evenings and weekends, UK time</span>
            </li>
          </ul>
        </address>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-pine-200 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.tutorName}. All rights reserved.
          </p>
          <p>Secure payments by Stripe · Calendar invitations by Google</p>
        </div>
      </div>
    </footer>
  );
}
