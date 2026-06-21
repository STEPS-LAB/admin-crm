import type { PublicSiteLanguage } from "@/types/public-site";
import type { SitemapEntityType } from "@/types/sitemap-robots";

export type PublicSeoOwnerType = SitemapEntityType;

export const PUBLIC_HREFLANG_LOCALES: Record<PublicSiteLanguage, string> = {
  uk: "uk-UA",
  en: "en",
};

export const PUBLIC_OPEN_GRAPH_LOCALES: Record<PublicSiteLanguage, string> = {
  uk: "uk_UA",
  en: "en_US",
};

export interface PublicHreflangAlternate {
  readonly language: PublicSiteLanguage;
  readonly href: string;
  readonly hreflang: string;
  readonly isDefault: boolean;
}

export interface PublicEntitySeoRecord {
  readonly metaTitle: string | null;
  readonly metaDescription: string | null;
  readonly canonicalUrl: string | null;
  readonly autoGenerateCanonical: boolean;
  readonly forceHttps: boolean;
  readonly removeTrailingSlash: boolean;
  readonly lowercaseCanonical: boolean;
  readonly robotsIndex: boolean;
  readonly robotsFollow: boolean;
  readonly ogTitle: string | null;
  readonly ogDescription: string | null;
  readonly ogImage: string | null;
  readonly ogType: string | null;
  readonly ogLocale: string | null;
  readonly ogSiteName: string | null;
  readonly twitterCardType: string | null;
  readonly twitterTitle: string | null;
  readonly twitterDescription: string | null;
  readonly twitterImage: string | null;
  readonly manualHreflang: readonly PublicHreflangAlternate[];
  readonly structuredData: readonly Record<string, unknown>[];
}

export interface PublicPageSeoContent {
  readonly title: string;
  readonly description: string | null;
  readonly imageUrl: string | null;
  readonly ownerType: PublicSeoOwnerType;
  readonly ownerId: string;
  readonly slug: string;
  readonly isHomepage?: boolean;
}

export interface PublicPageSeoResult {
  readonly metadata: import("next").Metadata;
  readonly structuredData: readonly Record<string, unknown>[];
}
