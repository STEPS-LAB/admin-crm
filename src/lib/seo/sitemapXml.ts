import { escapeXml } from "@/lib/seo/xml";

import type { SitemapEntry } from "@/types/sitemap-robots";

export function buildSitemapXml(entries: readonly SitemapEntry[]): string {
  const indexedEntries = entries.filter((entry) => entry.indexed && !entry.excluded);

  const urlNodes = indexedEntries
    .map((entry) => {
      const lastmod = entry.lastmod.toISOString();

      return [
        "  <url>",
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`,
        `    <priority>${escapeXml(entry.priority)}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlNodes,
    "</urlset>",
  ].join("\n");
}
