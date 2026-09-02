import Link from "next/link";
import { SITE } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-cream-200 bg-cream-100">
      <div className="container-x grid gap-10 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-xl text-pine-900">{SITE.name}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            One-to-one online tutoring in science, maths and medicine from a final-year medical student at the University of East Anglia.
          </p>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3">Get in touch</p>
          <a href={`mailto:${SITE.contactEmail}`} className="block text-pine-800 underline-offset-4 hover:underline">
            {SITE.contactEmail}
          </a>
          {SITE.showPhone && (
            <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`} className="mt-1 block text-pine-800 underline-offset-4 hover:underline">
              {SITE.phone}
            </a>
          )}
          <p className="mt-1 text-muted">{SITE.location} · sessions online via Google Meet</p>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3">Site</p>
          <ul className="space-y-1.5">
            <li>
              <Link href="/book" className="text-pine-800 hover:underline underline-offset-4">
                Book a session
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-pine-800 hover:underline underline-offset-4">
                Terms and cancellation policy
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-pine-800 hover:underline underline-offset-4">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-200">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.tutorName}. All rights reserved.</p>
          <p>Secure payments by Stripe · Calendar invitations by Google</p>
        </div>
      </div>
    </footer>
  );
}
