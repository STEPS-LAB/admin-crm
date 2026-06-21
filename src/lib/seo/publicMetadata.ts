import type { Metadata } from "next";

import { buildBreadcrumbListJsonLd } from "@/lib/seo/breadcrumbJsonLd";
import { buildPublicEntityUrl, normalizeSiteUrl } from "@/lib/seo/publicUrls";
import type { PublicBreadcrumbItem } from "@/lib/public-site/breadcrumbTrails";
import { getPublicSiteMessage } from "@/lib/public-site/messages";
import { buildPublicSiteSearchHref } from "@/lib/public-site/paths";
import {
  PUBLIC_HREFLANG_LOCALES,
  PUBLIC_OPEN_GRAPH_LOCALES,
  type PublicEntitySeoRecord,
  type PublicHreflangAlternate,
  type PublicPageSeoContent,
  type PublicPageSeoResult,
  type PublicSeoOwnerType,
} from "@/types/public-seo";

import type { PublicSiteLanguage } from "@/types/public-site";
import type { SettingsRecord } from "@/types/settings";

interface BuildPublicPageSeoInput {
  readonly settings: SettingsRecord;
  readonly language: PublicSiteLanguage;
  readonly supportedLanguages: readonly PublicSiteLanguage[];
  readonly content: PublicPageSeoContent;
  readonly seoRecord: PublicEntitySeoRecord | null;
  readonly hreflangAlternates: readonly PublicHreflangAlternate[];
  readonly breadcrumbs?: readonly PublicBreadcrumbItem[];
}

function normalizeCanonicalUrl(
  url: string,
  options: {
    readonly forceHttps: boolean;
    readonly removeTrailingSlash: boolean;
    readonly lowercase: boolean;
  },
): string {
  let normalized = url.trim();

  if (options.forceHttps) {
    normalized = normalized.replace(/^http:\/\//i, "https://");
  }

  if (options.lowercase) {
    normalized = normalized.toLowerCase();
  }

  if (options.removeTrailingSlash) {
    normalized = normalized.replace(/\/+$/, "");
  }

  return normalized;
}

function resolveTitle(
  content: PublicPageSeoContent,
  seoRecord: PublicEntitySeoRecord | null,
  settings: SettingsRecord,
): string {
  return (
    seoRecord?.metaTitle ??
    seoRecord?.ogTitle ??
    content.title ??
    settings.defaultMetaTitle ??
    settings.siteName
  );
}

function resolveDescription(
  content: PublicPageSeoContent,
  seoRecord: PublicEntitySeoRecord | null,
  settings: SettingsRecord,
): string | undefined {
  const description =
    seoRecord?.metaDescription ??
    seoRecord?.ogDescription ??
    content.description ??
    settings.defaultMetaDescription ??
    settings.siteDescription;

  return description ?? undefined;
}

function resolveCanonicalUrl(input: BuildPublicPageSeoInput): string {
  const { settings, language, content, seoRecord } = input;
  const siteUrl = normalizeSiteUrl(settings.siteUrl);
  const canonicalOptions = {
    forceHttps: seoRecord?.forceHttps ?? true,
    removeTrailingSlash: seoRecord?.removeTrailingSlash ?? false,
    lowercase: seoRecord?.lowercaseCanonical ?? true,
  };

  if (seoRecord?.canonicalUrl && !seoRecord.autoGenerateCanonical) {
    return normalizeCanonicalUrl(seoRecord.canonicalUrl, canonicalOptions);
  }

  const generated = buildPublicEntityUrl(siteUrl, content.ownerType, language, content.slug, {
    ...(content.isHomepage ? { isHomepage: true } : {}),
  });

  return normalizeCanonicalUrl(generated, canonicalOptions);
}

function resolveImageUrl(
  content: PublicPageSeoContent,
  seoRecord: PublicEntitySeoRecord | null,
  settings: SettingsRecord,
): string | undefined {
  return (
    seoRecord?.ogImage ??
    seoRecord?.twitterImage ??
    content.imageUrl ??
    settings.defaultOgImage ??
    undefined
  );
}

function resolveHreflangAlternates(
  seoRecord: PublicEntitySeoRecord | null,
  automaticAlternates: readonly PublicHreflangAlternate[],
  settings: SettingsRecord,
): PublicHreflangAlternate[] {
  if (!settings.localizedUrlsEnabled) {
    return [];
  }

  if (seoRecord && seoRecord.manualHreflang.length > 0) {
    return [...seoRecord.manualHreflang];
  }

  return [...automaticAlternates];
}

function resolveRobots(
  seoRecord: PublicEntitySeoRecord | null,
  settings: SettingsRecord,
): NonNullable<Metadata["robots"]> {
  const index = seoRecord?.robotsIndex ?? settings.defaultIndexing;
  const follow = seoRecord?.robotsFollow ?? settings.defaultFollow;

  return {
    index,
    follow,
  };
}

function buildHreflangLanguages(
  alternates: readonly PublicHreflangAlternate[],
  settings: SettingsRecord,
): Record<string, string> | undefined {
  if (!settings.localizedUrlsEnabled || alternates.length === 0) {
    return undefined;
  }

  const languages: Record<string, string> = {};

  for (const alternate of alternates) {
    languages[alternate.hreflang] = alternate.href;
  }

  const defaultAlternate =
    alternates.find((alternate) => alternate.isDefault) ??
    alternates.find((alternate) => alternate.language === settings.defaultLanguage) ??
    alternates[0];

  if (defaultAlternate) {
    languages["x-default"] = defaultAlternate.href;
  }

  return languages;
}

function buildDefaultStructuredData(
  input: BuildPublicPageSeoInput,
  canonicalUrl: string,
  title: string,
  description: string | undefined,
): Record<string, unknown>[] {
  if (!input.settings.autoGenerateSchemas) {
    return [];
  }

  const documents: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: input.settings.siteName,
      url: normalizeSiteUrl(input.settings.siteUrl),
      inLanguage: PUBLIC_HREFLANG_LOCALES[input.language],
    },
  ];

  if (input.content.ownerType === "product") {
    documents.push({
      "@context": "https://schema.org",
      "@type": "Product",
      name: title,
      description,
      url: canonicalUrl,
    });
  } else if (input.content.ownerType === "brand") {
    documents.push({
      "@context": "https://schema.org",
      "@type": "Brand",
      name: title,
      url: canonicalUrl,
    });
  } else if (input.content.ownerType === "category") {
    documents.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: canonicalUrl,
    });
  } else {
    documents.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url: canonicalUrl,
      inLanguage: PUBLIC_HREFLANG_LOCALES[input.language],
    });
  }

  return documents;
}

export function buildPublicPageSeo(input: BuildPublicPageSeoInput): PublicPageSeoResult {
  const title = resolveTitle(input.content, input.seoRecord, input.settings);
  const description = resolveDescription(input.content, input.seoRecord, input.settings);
  const canonicalUrl = resolveCanonicalUrl(input);
  const imageUrl = resolveImageUrl(input.content, input.seoRecord, input.settings);
  const hreflangAlternates = resolveHreflangAlternates(
    input.seoRecord,
    input.hreflangAlternates,
    input.settings,
  );
  const ogTitle = input.seoRecord?.ogTitle ?? title;
  const ogDescription = input.seoRecord?.ogDescription ?? description;
  const twitterTitle = input.seoRecord?.twitterTitle ?? ogTitle;
  const twitterDescription = input.seoRecord?.twitterDescription ?? ogDescription;
  const twitterCard = input.seoRecord?.twitterCardType ?? input.settings.defaultTwitterCard ?? "summary_large_image";
  const ogType = input.seoRecord?.ogType ?? (input.content.ownerType === "product" ? "product" : "website");

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: buildHreflangLanguages(hreflangAlternates, input.settings),
    },
    robots: resolveRobots(input.seoRecord, input.settings),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      siteName: input.seoRecord?.ogSiteName ?? input.settings.siteName,
      locale: input.seoRecord?.ogLocale ?? PUBLIC_OPEN_GRAPH_LOCALES[input.language],
      type: ogType === "article" || ogType === "profile" ? ogType : "website",
      ...(imageUrl
        ? {
            images: [
              {
                url: imageUrl,
                alt: title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: twitterCard === "summary" ? "summary" : "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };

  const structuredData = [
    ...buildDefaultStructuredData(input, canonicalUrl, title, description),
    ...(input.seoRecord?.structuredData ?? []),
    ...(input.settings.autoGenerateSchemas && input.breadcrumbs && input.breadcrumbs.length > 0
      ? [
          buildBreadcrumbListJsonLd({
            siteUrl: input.settings.siteUrl,
            language: input.language,
            items: input.breadcrumbs,
            currentPageUrl: canonicalUrl,
          }),
        ]
      : []),
  ];

  return {
    metadata,
    structuredData,
  };
}

export function buildMaintenanceMetadata(
  language: PublicSiteLanguage,
  siteName: string,
): Metadata {
  return {
    title: `${getPublicSiteMessage(language, "maintenance.title")} | ${siteName}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export function buildNotFoundMetadata(language: PublicSiteLanguage): Metadata {
  return {
    title: getPublicSiteMessage(language, "notFound.title"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

interface BuildPublicUtilityPageSeoInput {
  readonly settings: SettingsRecord;
  readonly language: PublicSiteLanguage;
  readonly supportedLanguages: readonly PublicSiteLanguage[];
  readonly title: string;
  readonly description?: string;
  readonly pathname: string;
  readonly query?: string;
  readonly breadcrumbs?: readonly PublicBreadcrumbItem[];
}

function buildUtilityHreflangAlternates(
  input: BuildPublicUtilityPageSeoInput,
): PublicHreflangAlternate[] {
  if (!input.settings.localizedUrlsEnabled) {
    return [];
  }

  const siteUrl = normalizeSiteUrl(input.settings.siteUrl);
  const defaultLanguage: PublicSiteLanguage =
    input.settings.defaultLanguage === "en" ? "en" : "uk";

  return input.supportedLanguages.map((language) => {
    let pathname: string;

    if (input.query && input.query.length > 0) {
      pathname = buildPublicSiteSearchHref(language, input.query);
    } else if (input.pathname.includes("/search")) {
      pathname = buildPublicSiteSearchHref(language);
    } else {
      pathname = input.pathname.replace(/^\/(uk|en)/, `/${language}`);
    }

    return {
      language,
      href: `${siteUrl}${pathname}`,
      hreflang: PUBLIC_HREFLANG_LOCALES[language],
      isDefault: language === defaultLanguage,
    };
  });
}

export function buildPublicUtilityPageSeo(
  input: BuildPublicUtilityPageSeoInput,
): PublicPageSeoResult {
  const siteUrl = normalizeSiteUrl(input.settings.siteUrl);
  const canonicalUrl = `${siteUrl}${input.pathname}`;
  const hreflangAlternates = buildUtilityHreflangAlternates(input);
  const description = input.description ?? input.settings.defaultMetaDescription ?? undefined;

  const metadata: Metadata = {
    title: input.title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: buildHreflangLanguages(hreflangAlternates, input.settings),
    },
    robots: {
      index: false,
      follow: input.settings.defaultFollow,
    },
    openGraph: {
      title: input.title,
      description,
      url: canonicalUrl,
      siteName: input.settings.siteName,
      locale: PUBLIC_OPEN_GRAPH_LOCALES[input.language],
      type: "website",
    },
    twitter: {
      card: "summary",
      title: input.title,
      description,
    },
  };

  const structuredData: Record<string, unknown>[] = [];

  if (input.settings.autoGenerateSchemas) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: input.title,
      description,
      url: canonicalUrl,
      inLanguage: PUBLIC_HREFLANG_LOCALES[input.language],
    });

    if (input.breadcrumbs && input.breadcrumbs.length > 0) {
      structuredData.push(
        buildBreadcrumbListJsonLd({
          siteUrl,
          language: input.language,
          items: input.breadcrumbs,
          currentPageUrl: canonicalUrl,
        }),
      );
    }
  }

  return {
    metadata,
    structuredData,
  };
}

export type { PublicSeoOwnerType };
