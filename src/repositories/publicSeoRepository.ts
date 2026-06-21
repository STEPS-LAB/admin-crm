import { and, asc, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  brandTranslations,
  brands,
  categories,
  categoryTranslations,
  productTranslations,
  products,
} from "@/db/schema/catalog";
import { pageTranslations, pages } from "@/db/schema/pages";
import {
  canonical,
  hreflang,
  metadata,
  openGraph,
  robots,
  schemaDocuments,
  seoProfiles,
  twitterCards,
} from "@/db/schema/seo";
import { buildPublicEntityUrl, normalizeSiteUrl } from "@/lib/seo/publicUrls";
import { softDeleteFilter } from "@/repositories/baseRepository";
import {
  PUBLIC_HREFLANG_LOCALES,
  type PublicEntitySeoRecord,
  type PublicHreflangAlternate,
  type PublicSeoOwnerType,
} from "@/types/public-seo";

import type { PublicSiteLanguage } from "@/types/public-site";
import type { SettingsRecord } from "@/types/settings";

function mapHreflangRow(
  row: { language: "uk" | "en"; url: string; isDefault: boolean },
): PublicHreflangAlternate {
  return {
    language: row.language,
    href: row.url,
    hreflang: PUBLIC_HREFLANG_LOCALES[row.language],
    isDefault: row.isDefault,
  };
}

export async function findEntitySeoRecord(
  ownerType: PublicSeoOwnerType,
  ownerId: string,
  language: PublicSiteLanguage,
): Promise<PublicEntitySeoRecord | null> {
  const db = getDb();

  const [row] = await db
    .select({
      metaTitle: metadata.metaTitle,
      metaDescription: metadata.metaDescription,
      canonicalUrl: canonical.canonicalUrl,
      autoGenerateCanonical: canonical.autoGenerate,
      forceHttps: canonical.forceHttps,
      removeTrailingSlash: canonical.removeTrailingSlash,
      lowercaseCanonical: canonical.lowercase,
      robotsIndex: robots.index,
      robotsFollow: robots.follow,
      ogTitle: openGraph.ogTitle,
      ogDescription: openGraph.ogDescription,
      ogImage: openGraph.ogImage,
      ogType: openGraph.ogType,
      ogLocale: openGraph.ogLocale,
      ogSiteName: openGraph.ogSiteName,
      twitterCardType: twitterCards.cardType,
      twitterTitle: twitterCards.title,
      twitterDescription: twitterCards.description,
      twitterImage: twitterCards.image,
      seoProfileId: seoProfiles.id,
    })
    .from(seoProfiles)
    .leftJoin(metadata, eq(metadata.seoProfileId, seoProfiles.id))
    .leftJoin(canonical, eq(canonical.seoProfileId, seoProfiles.id))
    .leftJoin(robots, eq(robots.seoProfileId, seoProfiles.id))
    .leftJoin(openGraph, eq(openGraph.seoProfileId, seoProfiles.id))
    .leftJoin(twitterCards, eq(twitterCards.seoProfileId, seoProfiles.id))
    .where(
      and(
        eq(seoProfiles.ownerType, ownerType),
        eq(seoProfiles.ownerId, ownerId),
        eq(seoProfiles.language, language),
        isNull(seoProfiles.deletedAt),
      ),
    )
    .limit(1);

  if (!row?.seoProfileId) {
    return null;
  }

  const [hreflangRows, schemaRows] = await Promise.all([
    db
      .select({
        language: hreflang.language,
        url: hreflang.url,
        isDefault: hreflang.isDefault,
      })
      .from(hreflang)
      .where(eq(hreflang.seoProfileId, row.seoProfileId)),
    db
      .select({
        json: schemaDocuments.json,
      })
      .from(schemaDocuments)
      .where(
        and(eq(schemaDocuments.seoProfileId, row.seoProfileId), eq(schemaDocuments.enabled, true)),
      )
      .orderBy(asc(schemaDocuments.priority)),
  ]);

  return {
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    canonicalUrl: row.canonicalUrl,
    autoGenerateCanonical: row.autoGenerateCanonical ?? true,
    forceHttps: row.forceHttps ?? true,
    removeTrailingSlash: row.removeTrailingSlash ?? false,
    lowercaseCanonical: row.lowercaseCanonical ?? true,
    robotsIndex: row.robotsIndex ?? true,
    robotsFollow: row.robotsFollow ?? true,
    ogTitle: row.ogTitle,
    ogDescription: row.ogDescription,
    ogImage: row.ogImage,
    ogType: row.ogType,
    ogLocale: row.ogLocale,
    ogSiteName: row.ogSiteName,
    twitterCardType: row.twitterCardType,
    twitterTitle: row.twitterTitle,
    twitterDescription: row.twitterDescription,
    twitterImage: row.twitterImage,
    manualHreflang: hreflangRows.map(mapHreflangRow),
    structuredData: schemaRows
      .map((schemaRow) => schemaRow.json)
      .filter((value): value is Record<string, unknown> => typeof value === "object" && value !== null),
  };
}

function buildAlternate(
  language: PublicSiteLanguage,
  href: string,
  isDefault: boolean,
): PublicHreflangAlternate {
  return {
    language,
    href,
    hreflang: PUBLIC_HREFLANG_LOCALES[language],
    isDefault,
  };
}

export async function findAutomaticHreflangAlternates(
  ownerType: PublicSeoOwnerType,
  ownerId: string,
  settings: SettingsRecord,
  supportedLanguages: readonly PublicSiteLanguage[],
): Promise<PublicHreflangAlternate[]> {
  const db = getDb();
  const siteUrl = normalizeSiteUrl(settings.siteUrl);
  const defaultLanguage: PublicSiteLanguage = settings.defaultLanguage === "en" ? "en" : "uk";
  const alternates: PublicHreflangAlternate[] = [];

  if (ownerType === "product") {
    const rows = await db
      .select({
        language: productTranslations.language,
        slug: productTranslations.slug,
      })
      .from(productTranslations)
      .innerJoin(products, eq(productTranslations.productId, products.id))
      .where(
        and(
          eq(products.id, ownerId),
          softDeleteFilter(products.deletedAt),
          eq(products.status, "published"),
        ),
      );

    for (const language of supportedLanguages) {
      const translation = rows.find((row) => row.language === language && row.slug);

      if (!translation?.slug) {
        continue;
      }

      alternates.push(
        buildAlternate(
          language,
          buildPublicEntityUrl(siteUrl, "product", language, translation.slug),
          language === defaultLanguage,
        ),
      );
    }

    return alternates;
  }

  if (ownerType === "category") {
    const rows = await db
      .select({
        language: categoryTranslations.language,
        slug: categoryTranslations.slug,
      })
      .from(categoryTranslations)
      .innerJoin(categories, eq(categoryTranslations.categoryId, categories.id))
      .where(
        and(
          eq(categories.id, ownerId),
          softDeleteFilter(categories.deletedAt),
          eq(categories.status, "published"),
        ),
      );

    for (const language of supportedLanguages) {
      const translation = rows.find((row) => row.language === language && row.slug);

      if (!translation?.slug) {
        continue;
      }

      alternates.push(
        buildAlternate(
          language,
          buildPublicEntityUrl(siteUrl, "category", language, translation.slug),
          language === defaultLanguage,
        ),
      );
    }

    return alternates;
  }

  if (ownerType === "page") {
    const rows = await db
      .select({
        language: pageTranslations.language,
        slug: pageTranslations.slug,
        isHomepage: pages.isHomepage,
      })
      .from(pageTranslations)
      .innerJoin(pages, eq(pageTranslations.pageId, pages.id))
      .where(
        and(eq(pages.id, ownerId), softDeleteFilter(pages.deletedAt), eq(pages.status, "published")),
      );

    for (const language of supportedLanguages) {
      const translation = rows.find((row) => row.language === language);

      if (!translation) {
        continue;
      }

      alternates.push(
        buildAlternate(
          language,
          buildPublicEntityUrl(siteUrl, "page", language, translation.slug, {
            isHomepage: translation.isHomepage,
          }),
          language === defaultLanguage,
        ),
      );
    }

    return alternates;
  }

  const [brandRow] = await db
    .select({ slug: brands.slug })
    .from(brands)
    .where(and(eq(brands.id, ownerId), softDeleteFilter(brands.deletedAt), eq(brands.status, "published")))
    .limit(1);

  if (!brandRow?.slug) {
    return alternates;
  }

  const translations = await db
    .select({ language: brandTranslations.language })
    .from(brandTranslations)
    .where(eq(brandTranslations.brandId, ownerId));

  for (const language of supportedLanguages) {
    const translation = translations.find((row) => row.language === language);

    if (!translation) {
      continue;
    }

    alternates.push(
      buildAlternate(
        language,
        buildPublicEntityUrl(siteUrl, "brand", language, brandRow.slug),
        language === defaultLanguage,
      ),
    );
  }

  return alternates;
}

export async function findPublishedHomepagePageId(
  language: PublicSiteLanguage,
): Promise<string | null> {
  const db = getDb();

  const [row] = await db
    .select({ id: pages.id })
    .from(pages)
    .innerJoin(pageTranslations, eq(pageTranslations.pageId, pages.id))
    .where(
      and(
        eq(pages.isHomepage, true),
        eq(pages.status, "published"),
        eq(pageTranslations.language, language),
        softDeleteFilter(pages.deletedAt),
      ),
    )
    .limit(1);

  return row?.id ?? null;
}
