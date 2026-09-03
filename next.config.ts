import type { NextConfig } from "next";

const securityHeaders = [
  // Two years, subdomains included; www and tuition already serve HTTPS and redirect here.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.stripe.com\"), interest-cohort=()" },
  // The booking form collects personal details, so no page may be framed. A full CSP needs a nonce for Next's inline scripts.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // API responses are never search results.
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
  async redirects() {
    return [{ source: "/index", destination: "/", permanent: true }];
  },
};

export default nextConfig;
