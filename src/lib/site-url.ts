import type { NextRequest } from "next/server";

/**
 * Public origin for redirects and metadata.
 * Order: NEXT_PUBLIC_SITE_URL, then the request host if it is one of ours, then Vercel's production URL.
 * Forwarded headers are only trusted for hosts we recognise, so they cannot steer Stripe redirects elsewhere.
 */
export function siteOrigin(req?: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const known = new Set(
    [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL, process.env.CUSTOM_DOMAIN]
      .filter((h): h is string => Boolean(h))
      .map((h) => h.toLowerCase()),
  );

  if (req) {
    const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host).toLowerCase();
    const hostname = host.split(":")[0];
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    const isOurs = known.has(host) || hostname.endsWith(".vercel.app") || (process.env.CUSTOM_DOMAIN ? hostname.endsWith(process.env.CUSTOM_DOMAIN.toLowerCase()) : false);
    if (isLocal || isOurs) return `${isLocal ? "http" : "https"}://${host}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
