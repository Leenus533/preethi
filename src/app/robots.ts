import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    // /book/success is noindex; disallowing it as well would stop crawlers ever seeing that tag.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
