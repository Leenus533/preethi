import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";

/** Uses public/preethi.jpg if present, otherwise a tasteful monogram card. */
export function TutorPortrait({ className = "" }: { className?: string }) {
  const hasPhoto = existsSync(join(process.cwd(), "public", "preethi.jpg"));
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-pine-100 via-cream-100 to-clay-100" aria-hidden />
      <div className="card relative aspect-[4/5] overflow-hidden rounded-[1.75rem]">
        {hasPhoto ? (
          <Image src="/preethi.jpg" alt="Preethi Amudhan" fill sizes="(min-width: 1024px) 420px, 80vw" className="object-cover" priority />
        ) : (
          <div className="flex h-full flex-col justify-between bg-gradient-to-b from-pine-700 to-pine-900 p-6 pb-16 text-white sm:pb-6">
            <span className="eyebrow !text-pine-200">Your tutor</span>
            <div>
              <span className="font-display text-7xl leading-none">PA</span>
              <p className="mt-3 font-display text-2xl">Preethi Amudhan</p>
              <p className="mt-1 text-sm text-pine-100">Final-year medical student, UEA</p>
            </div>
          </div>
        )}
      </div>
      <div className="card absolute -bottom-5 right-3 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm sm:-right-8">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-clay-100 text-clay-700">★</span>
        <div>
          <p className="font-semibold text-ink">Top 10% UCAT</p>
          <p className="text-xs text-muted">A, A, A at A-level</p>
        </div>
      </div>
    </div>
  );
}
