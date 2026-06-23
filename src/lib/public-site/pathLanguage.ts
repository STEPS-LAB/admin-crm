import type { PublicSiteLanguage } from "@/types/public-site";

export const PUBLIC_SITE_LANGUAGE_SEGMENTS = ["uk", "en"] as const;

export type PublicSiteLanguageSegment = (typeof PUBLIC_SITE_LANGUAGE_SEGMENTS)[number];

export function isPublicSiteLanguageSegment(value: string): value is PublicSiteLanguageSegment {
  return value === "uk" || value === "en";
}

export function toPublicSiteLanguage(segment: PublicSiteLanguageSegment): PublicSiteLanguage {
  return segment;
}

export function replaceLanguageInPathname(
  pathname: string | null | undefined,
  language: PublicSiteLanguage,
): string {
  const safePathname = pathname?.trim() || "/";

  const segments = safePathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${language}`;
  }

  if (isPublicSiteLanguageSegment(segments[0]!)) {
    segments[0] = language;
    return `/${segments.join("/")}`;
  }

  return `/${language}${safePathname.startsWith("/") ? safePathname : `/${safePathname}`}`;
}

export function isPublicSiteHomePath(pathname: string | null | undefined): boolean {
  const segments = (pathname ?? "").split("/").filter(Boolean);
  return segments.length === 1 && isPublicSiteLanguageSegment(segments[0]!);
}

export function resolveLegacySiteLanguage(
  langParam: string | undefined,
  defaultLanguage: PublicSiteLanguage,
): PublicSiteLanguage {
  if (langParam === "uk" || langParam === "en") {
    return langParam;
  }

  return defaultLanguage;
}

export function extractLanguageFromPathname(
  pathname: string | null | undefined,
): PublicSiteLanguage | null {
  const segments = (pathname ?? "").split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (!firstSegment || !isPublicSiteLanguageSegment(firstSegment)) {
    return null;
  }

  return toPublicSiteLanguage(firstSegment);
}
