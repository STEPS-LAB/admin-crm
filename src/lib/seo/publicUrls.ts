import type { SitemapEntityType } from "@/types/sitemap-robots";

const ENTITY_PATH_SEGMENTS: Record<SitemapEntityType, string> = {
  product: "products",
  category: "categories",
  page: "pages",
  brand: "brands",
};

export function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.replace(/\/+$/, "");
}

export function buildPublicEntityUrl(
  siteUrl: string,
  ownerType: SitemapEntityType,
  language: "uk" | "en",
  slug: string,
  options?: { readonly isHomepage?: boolean },
): string {
  const base = normalizeSiteUrl(siteUrl);

  if (options?.isHomepage) {
    return `${base}/${language}`;
  }

  const segment = ENTITY_PATH_SEGMENTS[ownerType];

  return `${base}/${language}/${segment}/${slug}`;
}

export function buildSitemapIndexUrl(siteUrl: string): string {
  return `${normalizeSiteUrl(siteUrl)}/sitemap.xml`;
}
