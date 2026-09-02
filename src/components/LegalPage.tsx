import Link from "next/link";

/** Shared frame for the terms and privacy pages. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="container-x py-12 sm:py-16">
      <article className="mx-auto max-w-[var(--measure)]">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="focus-ring rounded-sm hover:text-pine-900 hover:underline underline-offset-4">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink-soft">
              {title}
            </li>
          </ol>
        </nav>
        <h1 className="font-display font-display-lg mt-6 text-[length:var(--text-h2)] leading-[1.12] text-pine-900">{title}</h1>
        <p className="mt-3 text-sm text-muted">Last updated {updated}</p>
        <div className="prose-site mt-10 border-t border-cream-200 pt-8">{children}</div>
      </article>
    </div>
  );
}
