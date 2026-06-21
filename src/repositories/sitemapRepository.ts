import { and, eq, isNull } from "drizzle-orm";

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
import { robots, seoProfiles, sitemapConfig } from "@/db/schema/seo";
import { buildPublicEntityUrl } from "@/lib/seo/publicUrls";
import { SEO_OWNER_TYPE_LABELS } from "@/constants/seo";
import { softDeleteFilter } from "@/repositories/baseRepository";

import type {
  SitemapEntityType,
  SitemapEntry,
  SitemapSummary,
  SitemapTypeStats,
} from "@/types/sitemap-robots";

interface SitemapQueryOptions {
  readonly siteUrl: string;
  readonly defaultChangeFrequency: string;
  readonly includeImages: boolean;
}

function isIndexed(isIndexable: boolean | null, robotsIndex: boolean | null): boolean {
  if (isIndexable === false) {
    return false;
  }

  if (robotsIndex === false) {
    return false;
  }

  return true;
}

function formatPriority(value: string | null | undefined): string {
  if (!value) {
    return "0.5";
  }

  const parsed = Number.parseFloat(value);

  if (!Number.isFinite(parsed)) {
    return "0.5";
  }

  return parsed.toFixed(1);
}

async function findProductEntries(options: SitemapQueryOptions): Promise<SitemapEntry[]> {
  const db = getDb();

  const rows = await db
    .select({
      ownerId: products.id,
      language: productTranslations.language,
      slug: productTranslations.slug,
      label: productTranslations.name,
      updatedAt: products.updatedAt,
      isIndexable: seoProfiles.isIndexable,
      changeFrequency: seoProfiles.changeFrequency,
      priority: seoProfiles.priority,
      robotsIndex: robots.index,
      excluded: sitemapConfig.isExcluded,
    })
    .from(products)
    .innerJoin(productTranslations, eq(productTranslations.productId, products.id))
    .leftJoin(
      seoProfiles,
      and(
        eq(seoProfiles.ownerId, products.id),
        eq(seoProfiles.ownerType, "product"),
        eq(seoProfiles.language, productTranslations.language),
        isNull(seoProfiles.deletedAt),
      ),
    )
    .leftJoin(robots, eq(robots.seoProfileId, seoProfiles.id))
    .leftJoin(
      sitemapConfig,
      and(eq(sitemapConfig.ownerType, "product"), eq(sitemapConfig.ownerId, products.id)),
    )
    .where(and(eq(products.status, "published"), softDeleteFilter(products.deletedAt)));

  return rows.map((row) => {
    const language = row.language as "uk" | "en";
    const excluded = row.excluded === true;
    const indexed = isIndexed(row.isIndexable, row.robotsIndex);

    return {
      ownerType: "product",
      ownerId: row.ownerId,
      language,
      slug: row.slug,
      label: row.label,
      loc: buildPublicEntityUrl(options.siteUrl, "product", language, row.slug),
      lastmod: row.updatedAt,
      changefreq: row.changeFrequency ?? options.defaultChangeFrequency,
      priority: formatPriority(row.priority),
      indexed,
      excluded,
    };
  });
}

async function findCategoryEntries(options: SitemapQueryOptions): Promise<SitemapEntry[]> {
  const db = getDb();

  const rows = await db
    .select({
      ownerId: categories.id,
      language: categoryTranslations.language,
      slug: categoryTranslations.slug,
      label: categoryTranslations.name,
      updatedAt: categories.updatedAt,
      isIndexable: seoProfiles.isIndexable,
      changeFrequency: seoProfiles.changeFrequency,
      priority: seoProfiles.priority,
      robotsIndex: robots.index,
      excluded: sitemapConfig.isExcluded,
    })
    .from(categories)
    .innerJoin(categoryTranslations, eq(categoryTranslations.categoryId, categories.id))
    .leftJoin(
      seoProfiles,
      and(
        eq(seoProfiles.ownerId, categories.id),
        eq(seoProfiles.ownerType, "category"),
        eq(seoProfiles.language, categoryTranslations.language),
        isNull(seoProfiles.deletedAt),
      ),
    )
    .leftJoin(robots, eq(robots.seoProfileId, seoProfiles.id))
    .leftJoin(
      sitemapConfig,
      and(eq(sitemapConfig.ownerType, "category"), eq(sitemapConfig.ownerId, categories.id)),
    )
    .where(and(eq(categories.status, "published"), softDeleteFilter(categories.deletedAt)));

  return rows.map((row) => {
    const language = row.language as "uk" | "en";
    const excluded = row.excluded === true;
    const indexed = isIndexed(row.isIndexable, row.robotsIndex);

    return {
      ownerType: "category",
      ownerId: row.ownerId,
      language,
      slug: row.slug,
      label: row.label,
      loc: buildPublicEntityUrl(options.siteUrl, "category", language, row.slug),
      lastmod: row.updatedAt,
      changefreq: row.changeFrequency ?? options.defaultChangeFrequency,
      priority: formatPriority(row.priority),
      indexed,
      excluded,
    };
  });
}

async function findPageEntries(options: SitemapQueryOptions): Promise<SitemapEntry[]> {
  const db = getDb();

  const rows = await db
    .select({
      ownerId: pages.id,
      language: pageTranslations.language,
      slug: pageTranslations.slug,
      label: pageTranslations.title,
      updatedAt: pages.updatedAt,
      isHomepage: pages.isHomepage,
      isIndexable: seoProfiles.isIndexable,
      changeFrequency: seoProfiles.changeFrequency,
      priority: seoProfiles.priority,
      robotsIndex: robots.index,
      excluded: sitemapConfig.isExcluded,
    })
    .from(pages)
    .innerJoin(pageTranslations, eq(pageTranslations.pageId, pages.id))
    .leftJoin(
      seoProfiles,
      and(
        eq(seoProfiles.ownerId, pages.id),
        eq(seoProfiles.ownerType, "page"),
        eq(seoProfiles.language, pageTranslations.language),
        isNull(seoProfiles.deletedAt),
      ),
    )
    .leftJoin(robots, eq(robots.seoProfileId, seoProfiles.id))
    .leftJoin(
      sitemapConfig,
      and(eq(sitemapConfig.ownerType, "page"), eq(sitemapConfig.ownerId, pages.id)),
    )
    .where(and(eq(pages.status, "published"), softDeleteFilter(pages.deletedAt)));

  return rows.map((row) => {
    const language = row.language as "uk" | "en";
    const excluded = row.excluded === true;
    const indexed = isIndexed(row.isIndexable, row.robotsIndex);

    return {
      ownerType: "page",
      ownerId: row.ownerId,
      language,
      slug: row.slug,
      label: row.label,
      loc: buildPublicEntityUrl(options.siteUrl, "page", language, row.slug, {
        isHomepage: row.isHomepage,
      }),
      lastmod: row.updatedAt,
      changefreq: row.changeFrequency ?? options.defaultChangeFrequency,
      priority: row.isHomepage ? "1.0" : formatPriority(row.priority),
      indexed,
      excluded,
    };
  });
}

async function findBrandEntries(options: SitemapQueryOptions): Promise<SitemapEntry[]> {
  const db = getDb();

  const rows = await db
    .select({
      ownerId: brands.id,
      slug: brands.slug,
      language: brandTranslations.language,
      label: brandTranslations.name,
      updatedAt: brands.updatedAt,
      isIndexable: seoProfiles.isIndexable,
      changeFrequency: seoProfiles.changeFrequency,
      priority: seoProfiles.priority,
      robotsIndex: robots.index,
      excluded: sitemapConfig.isExcluded,
    })
    .from(brands)
    .innerJoin(brandTranslations, eq(brandTranslations.brandId, brands.id))
    .leftJoin(
      seoProfiles,
      and(
        eq(seoProfiles.ownerId, brands.id),
        eq(seoProfiles.ownerType, "brand"),
        eq(seoProfiles.language, brandTranslations.language),
        isNull(seoProfiles.deletedAt),
      ),
    )
    .leftJoin(robots, eq(robots.seoProfileId, seoProfiles.id))
    .leftJoin(
      sitemapConfig,
      and(eq(sitemapConfig.ownerType, "brand"), eq(sitemapConfig.ownerId, brands.id)),
    )
    .where(and(eq(brands.status, "published"), softDeleteFilter(brands.deletedAt)));

  return rows.map((row) => {
    const language = row.language as "uk" | "en";
    const excluded = row.excluded === true;
    const indexed = isIndexed(row.isIndexable, row.robotsIndex);

    return {
      ownerType: "brand",
      ownerId: row.ownerId,
      language,
      slug: row.slug,
      label: row.label,
      loc: buildPublicEntityUrl(options.siteUrl, "brand", language, row.slug),
      lastmod: row.updatedAt,
      changefreq: row.changeFrequency ?? options.defaultChangeFrequency,
      priority: formatPriority(row.priority),
      indexed,
      excluded,
    };
  });
}

function buildTypeStats(entries: SitemapEntry[]): SitemapTypeStats[] {
  const types: SitemapEntityType[] = ["product", "category", "page", "brand"];

  return types.map((ownerType) => {
    const typeEntries = entries.filter((entry) => entry.ownerType === ownerType);

    return {
      ownerType,
      label: SEO_OWNER_TYPE_LABELS[ownerType],
      total: typeEntries.length,
      indexed: typeEntries.filter((entry) => entry.indexed && !entry.excluded).length,
      excluded: typeEntries.filter((entry) => entry.excluded || !entry.indexed).length,
    };
  });
}

export async function findSitemapEntries(options: SitemapQueryOptions): Promise<SitemapEntry[]> {
  const [productEntries, categoryEntries, pageEntries, brandEntries] = await Promise.all([
    findProductEntries(options),
    findCategoryEntries(options),
    findPageEntries(options),
    findBrandEntries(options),
  ]);

  return [...productEntries, ...categoryEntries, ...pageEntries, ...brandEntries].sort((a, b) =>
    a.loc.localeCompare(b.loc),
  );
}

export function buildSitemapSummary(
  entries: SitemapEntry[],
  options: {
    readonly enabled: boolean;
    readonly autoGenerate: boolean;
    readonly siteUrl: string;
    readonly generatedAt?: Date;
  },
): SitemapSummary {
  const indexedUrls = entries.filter((entry) => entry.indexed && !entry.excluded).length;
  const excludedUrls = entries.filter((entry) => entry.excluded).length;
  const hiddenUrls = entries.filter((entry) => !entry.indexed && !entry.excluded).length;

  return {
    enabled: options.enabled,
    autoGenerate: options.autoGenerate,
    siteUrl: options.siteUrl,
    sitemapUrl: `${options.siteUrl.replace(/\/+$/, "")}/sitemap.xml`,
    totalUrls: entries.length,
    indexedUrls,
    excludedUrls,
    hiddenUrls,
    typeStats: buildTypeStats(entries),
    entries,
    generatedAt: options.generatedAt ?? new Date(),
  };
}
