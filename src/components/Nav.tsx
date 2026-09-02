import Link from "next/link";
import { SITE } from "@/lib/config";
import { SUBJECTS, subjectPath } from "@/lib/subjects";
import { Icon } from "@/components/ui/icons";
import { MOTIF } from "@/components/ui/motif";
import { MobileMenu } from "./MobileMenu";

export const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#about", label: "About" },
  { href: "/#pricing", label: "Prices" },
  { href: "/#faq", label: "FAQ" },
];

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`focus-ring flex items-center gap-2.5 rounded-lg ${className}`} aria-label={`${SITE.name} home`}>
      <span className="font-display grid h-9 w-9 place-items-center rounded-lg bg-pine-800 text-lg text-white">
        P
      </span>
      <span className="font-display text-lg leading-tight text-pine-900">
        Preethi Amudhan
        <span className="block font-sans text-[0.75rem] font-medium tracking-wide text-muted">Tutoring</span>
      </span>
    </Link>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream-50/90 backdrop-blur-md supports-[backdrop-filter]:bg-cream-50/80">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Wordmark />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          <div className="group relative">
            <Link
              href="/#subjects"
              className="focus-ring inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-ink-soft hover:bg-cream-100 hover:text-pine-900"
            >
              Subjects
              <Icon.Chevron width={14} height={14} className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden />
            </Link>
            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <ul className="card w-[19rem] p-2 shadow-[var(--shadow-lift)]">
                {SUBJECTS.map((s) => {
                  const M = MOTIF[s.motif];
                  return (
                    <li key={s.slug}>
                      <Link href={subjectPath(s)} className="focus-ring flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-cream-100">
                        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-pine-50 text-pine-700">
                          <M width={17} height={17} aria-hidden />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-pine-900">{s.title}</span>
                          <span className="block text-[0.75rem] leading-snug text-muted">{s.detail}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="focus-ring rounded-md px-3 py-2 text-sm font-medium text-ink-soft hover:bg-cream-100 hover:text-pine-900">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/book" className="btn btn-primary !px-4 !py-2.5 text-sm sm:!px-5 sm:!py-3 sm:text-[0.95rem]">
            <span className="sm:hidden">Book</span>
            <span className="hidden sm:inline">Book a session</span>
          </Link>
          <MobileMenu links={NAV_LINKS} subjects={SUBJECTS.map((s) => ({ href: subjectPath(s), label: s.title }))} />
        </div>
      </div>
    </header>
  );
}
