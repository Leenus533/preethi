"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Item = { href: string; label: string };

export function MobileMenu({ links, subjects }: { links: Item[]; subjects: Item[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="focus-ring grid h-10 w-10 place-items-center rounded-md border border-line bg-white text-pine-900"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>
      <div id="mobile-menu" hidden={!open} className="card absolute right-0 mt-2 w-72 p-2 shadow-[var(--shadow-lift)]">
        <p className="px-3 pb-1 pt-2 text-[0.7rem] font-semibold uppercase tracking-wide text-muted">Subjects</p>
        <ul className="grid grid-cols-2 gap-1">
          {subjects.map((s) => (
            <li key={s.href}>
              <Link href={s.href} onClick={close} className="block rounded-xl bg-cream-50 px-3 py-2 text-sm font-medium text-pine-900 hover:bg-cream-100">
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="my-2 border-t border-cream-200" />
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={close} className="block rounded-xl px-3 py-2 text-sm font-medium text-ink-soft hover:bg-cream-100">
            {l.label}
          </Link>
        ))}
        <Link href="/book" onClick={close} className="btn btn-primary mt-2 w-full">
          Book a session
        </Link>
      </div>
    </div>
  );
}
