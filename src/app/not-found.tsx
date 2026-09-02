import type { Metadata } from "next";
import Link from "next/link";
import { SUBJECTS, subjectPath } from "@/lib/subjects";
import { Icon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <div>
      <div className="container-x py-24 text-center">
        <h1 className="font-display font-display-lg text-[length:var(--text-h2)] text-pine-900">That page does not exist</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">The link may be out of date. Try one of these instead.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
          <Link href="/book" className="btn btn-secondary">
            Book a session <Icon.Arrow width={16} height={16} aria-hidden />
          </Link>
        </div>
        <ul className="mx-auto mt-10 flex max-w-xl flex-wrap justify-center gap-2 text-sm">
          {SUBJECTS.map((s) => (
            <li key={s.slug}>
              <Link href={subjectPath(s)} className="chip focus-ring hover:bg-pine-100">
                {s.title} tutoring
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
