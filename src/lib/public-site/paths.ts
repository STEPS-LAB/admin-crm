import type { PublicSiteLanguage } from "@/types/public-site";

export type PublicSiteEntitySegment = "products" | "categories" | "pages" | "brands";

export function buildPublicSiteHomeHref(language: PublicSiteLanguage): string {
  return `/${language}`;
}

export function buildPublicSiteEntityHref(
  segment: PublicSiteEntitySegment,
  slug: string,
  language: PublicSiteLanguage,
): string {
  return `/${language}/${segment}/${slug}`;
}

export function buildPublicSiteSectionHref(
  language: PublicSiteLanguage,
  sectionId: string,
): string {
  return `${buildPublicSiteHomeHref(language)}#${sectionId}`;
}

export function buildPublicSiteSearchHref(
  language: PublicSiteLanguage,
  query?: string,
): string {
  const base = `/${language}/search`;

  if (!query?.trim()) {
    return base;
  }

  return `${base}?q=${encodeURIComponent(query.trim())}`;
}
