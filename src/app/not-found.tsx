import type { Metadata } from "next";
import Link from "next/link";
import { SUBJECTS, subjectPath } from "@/lib/subjects";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <div className="container-x py-24">
      <div className="max-w-xl">
        <p className="text-[length:var(--text-meta)] text-muted">404</p>
        <h1 className="font-display font-display-lg mt-2 text-[length:var(--text-h2)] text-ink">That page does not exist</h1>
        <p className="mt-3 text-ink-soft">The link may be out of date. Everything on the site is one step away.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
          <Link href="/book" className="btn btn-secondary">
            Book a session
          </Link>
        </div>
        <ul className="mt-10 grid gap-2 text-sm">
          {SUBJECTS.map((s) => (
            <li key={s.slug}>
              <Link href={subjectPath(s)} className="link">
                {s.title} tutoring
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
