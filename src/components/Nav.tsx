import Link from "next/link";
import { SITE } from "@/lib/config";
import { SUBJECTS, subjectPath } from "@/lib/subjects";
import { Icon } from "@/components/ui/icons";
import { MobileMenu } from "./MobileMenu";

export const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#about", label: "About" },
  { href: "/#faq", label: "FAQ" },
];

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`focus-ring flex items-baseline gap-2 rounded-sm ${className}`} aria-label={`${SITE.name} home`}>
      <span className="text-[1.0625rem] font-semibold tracking-tight text-ink">Preethi Amudhan</span>
      <span className="text-sm text-muted">Tutoring</span>
    </Link>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream-50">
      <div className="container-x flex h-14 items-center justify-between gap-4">
        <Wordmark />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          <div className="group relative">
            <Link
              href="/#subjects"
              className="focus-ring inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-ink-soft hover:text-ink"
            >
              Subjects and prices
              <Icon.Chevron width={14} height={14} className="text-muted" aria-hidden />
            </Link>
            <div className="invisible absolute left-0 top-full pt-1 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <ul className="panel w-64 p-1.5">
                {SUBJECTS.map((s) => (
                  <li key={s.slug}>
                    <Link href={subjectPath(s)} className="focus-ring block rounded-md px-3 py-2 text-sm text-ink hover:bg-cream-100">
                      {s.title} tutoring
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="focus-ring rounded-md px-3 py-2 text-sm text-ink-soft hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/book" className="btn btn-primary !px-3.5 !py-2 text-sm">
            <span className="sm:hidden">Book</span>
            <span className="hidden sm:inline">Book a session</span>
          </Link>
          <MobileMenu links={NAV_LINKS} subjects={SUBJECTS.map((s) => ({ href: subjectPath(s), label: `${s.title} tutoring` }))} />
        </div>
      </div>
    </header>
  );
}
