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
  const item = "focus-ring block rounded-md px-3 py-2 text-sm text-ink hover:bg-cream-100";

  return (
    <div ref={ref} className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="focus-ring grid h-9 w-9 place-items-center rounded-md border border-line bg-white text-ink"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>
      <div id="mobile-menu" hidden={!open} className="panel absolute right-0 mt-2 w-64 p-1.5">
        <p className="px-3 pb-1 pt-2 text-[length:var(--text-meta)] text-muted">Subjects</p>
        {subjects.map((s) => (
          <Link key={s.href} href={s.href} onClick={close} className={item}>
            {s.label}
          </Link>
        ))}
        <div className="my-1.5 border-t border-cream-200" />
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={close} className={item}>
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
