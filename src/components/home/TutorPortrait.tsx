import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";

/** Uses public/preethi.jpg if present, otherwise a plain monogram card. */
export function TutorPortrait({ className = "" }: { className?: string }) {
  const hasPhoto = existsSync(join(process.cwd(), "public", "preethi.jpg"));
  return (
    <div className={className}>
      <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-cream-300">
        {hasPhoto ? (
          <Image
            src="/preethi.jpg"
            alt="Preethi Amudhan"
            width={840}
            height={1050}
            sizes="(min-width: 1024px) 420px, 80vw"
            className="h-full w-full object-cover"
            priority
          />
        ) : (
          <div className="flex h-full flex-col justify-end bg-pine-800 p-6 text-white">
            <span className="font-display font-display-xl text-7xl leading-none">PA</span>
            <p className="mt-3 font-display text-2xl">Preethi Amudhan</p>
            <p className="mt-1 text-[0.9375rem] text-pine-100">Final-year medical student, University of East Anglia</p>
          </div>
        )}
      </div>
    </div>
  );
}
