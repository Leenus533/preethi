import Link from "next/link";
import { SITE } from "@/lib/config";
import { MobileMenu } from "./MobileMenu";

const links = [
  { href: "/#subjects", label: "Subjects" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#about", label: "About" },
  { href: "/#pricing", label: "Prices" },
  { href: "/#faq", label: "FAQ" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-200/80 bg-cream-50/85 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${SITE.name} home`}>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-pine-700 font-display text-lg text-white">P</span>
          <span className="font-display text-lg leading-tight text-pine-900">
            Preethi Amudhan
            <span className="block text-[0.7rem] font-sans font-medium uppercase tracking-[0.18em] text-muted">Tutoring</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-ink-soft hover:text-pine-800">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/book" className="btn btn-primary hidden sm:inline-flex">
            Book a session
          </Link>
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
