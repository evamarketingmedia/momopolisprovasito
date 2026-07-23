import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { locales } from "@/lib/dictionaries";

const paths = ["", "chi-siamo", "galleria", "eventi", "pacchetti-feste", "contatti"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return paths.map((slug) => ({
    url: `${siteConfig.domain}/it${slug ? `/${slug}` : ""}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: slug === "" ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${siteConfig.domain}/${l}${slug ? `/${slug}` : ""}`])
      ),
    },
  }));
}
