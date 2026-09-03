import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { SEO } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "Preethi Tutoring",
    description: SEO.homeDescription,
    start_url: "/",
    display: "browser",
    background_color: "#fdfbf7",
    theme_color: "#fdfbf7",
    lang: "en-GB",
    categories: ["education"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
