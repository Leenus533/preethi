import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-url";
import { SEO } from "@/lib/seo";
import { SUBJECTS, subjectPath } from "@/lib/subjects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteOrigin();
  const updated = SEO.contentUpdated;
  const legal = SEO.legalUpdated;
  return [
    // No trailing slash: matches the canonical the home page emits.
    { url: base, lastModified: updated, changeFrequency: "monthly", priority: 1 },
    ...SUBJECTS.map((s) => ({
      url: `${base}${subjectPath(s)}`,
      lastModified: updated,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: `${base}/book`, lastModified: updated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/terms`, lastModified: legal, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: legal, changeFrequency: "yearly", priority: 0.3 },
  ];
}
