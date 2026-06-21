import {
  findPublicSeoProfilesPage,
  searchPublishedBrands,
  searchPublishedCategories,
  searchPublishedPages,
  searchPublishedProducts,
} from "@/repositories/publicApiRepository";
import {
  countPublishedCategories,
  countPublishedProducts,
  findPublishedBrandBySlug,
  findPublishedCategoryBySlug,
  findPublishedCategoryCardsPage,
  findPublishedPageBySlug,
  findPublishedProductBySlug,
  findPublishedProductCardsPage,
} from "@/repositories/publicSiteRepository";
import { PUBLIC_API_VERSION } from "@/constants/api";
import { getMedia } from "@/services/mediaService";
import { getSettings } from "@/services/settingsService";
import { getSitemapSummary } from "@/services/sitemapRobotsService";

import type {
  PublicApiDetailQuery,
  PublicApiListQuery,
  PublicApiSearchQuery,
  PublicApiSeoProfilesQuery,
  PublicApiSitemapQuery,
} from "@/schemas/api/publicApiSchemas";
import type {
  PublicApiHealthPayload,
  PublicApiListMeta,
  PublicApiMediaPayload,
  PublicApiPaginationMeta,
  PublicApiSearchPayload,
  PublicApiSeoProfileItem,
  PublicApiSettingsPayload,
  PublicApiSitemapEntry,
  PublicApiSitemapPayload,
} from "@/types/public-api";
import type {
  PublicSiteBrandDetail,
  PublicSiteCategoryCard,
  PublicSiteCategoryDetail,
  PublicSiteLanguage,
  PublicSitePageDetail,
  PublicSiteProductCard,
  PublicSiteProductDetail,
} from "@/types/public-site";

function buildPaginationMeta(page: number, limit: number, total: number): PublicApiPaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

function mapSitemapEntry(
  entry: Awaited<ReturnType<typeof getSitemapSummary>>["entries"][number],
): PublicApiSitemapEntry {
  return {
    ownerType: entry.ownerType,
    ownerId: entry.ownerId,
    language: entry.language,
    loc: entry.loc,
    slug: entry.slug,
    label: entry.label,
    lastmod: entry.lastmod.toISOString(),
    changefreq: entry.changefreq,
    priority: entry.priority,
    indexed: entry.indexed,
    excluded: entry.excluded,
  };
}

function mapPublicMedia(media: NonNullable<Awaited<ReturnType<typeof getMedia>>>): PublicApiMediaPayload {
  return {
    id: media.id,
    originalFilename: media.originalFilename,
    mimeType: media.mimeType,
    extension: media.extension,
    fileSize: media.fileSize,
    width: media.width,
    height: media.height,
    altUk: media.altUk,
    altEn: media.altEn,
    titleUk: media.titleUk,
    titleEn: media.titleEn,
    captionUk: media.captionUk,
    captionEn: media.captionEn,
    copyright: media.copyright,
    photographer: media.photographer,
    license: media.license,
    publicUrl: media.publicUrl,
    createdAt: media.createdAt.toISOString(),
    updatedAt: media.updatedAt.toISOString(),
  };
}

export async function getPublicApiHealth(): Promise<PublicApiHealthPayload> {
  return {
    status: "ok",
    version: PUBLIC_API_VERSION,
    timestamp: new Date().toISOString(),
  };
}

export async function getPublicApiSettings(): Promise<PublicApiSettingsPayload> {
  const settings = await getSettings();

  return {
    siteName: settings.siteName,
    siteDescription: settings.siteDescription,
    siteUrl: settings.siteUrl,
    defaultLanguage: settings.defaultLanguage,
    supportedLanguages: settings.supportedLanguages,
    timezone: settings.timezone,
    currency: settings.currency,
    localizedUrlsEnabled: settings.localizedUrlsEnabled,
  };
}

export async function listPublicApiProducts(
  query: PublicApiListQuery,
): Promise<{ readonly items: PublicSiteProductCard[]; readonly meta: PublicApiListMeta }> {
  const [items, total] = await Promise.all([
    findPublishedProductCardsPage(query.lang, query.page, query.limit),
    countPublishedProducts(),
  ]);

  return {
    items,
    meta: buildListMeta(query.lang, query.page, query.limit, total),
  };
}

export async function getPublicApiProduct(
  slug: string,
  query: PublicApiDetailQuery,
): Promise<PublicSiteProductDetail | null> {
  return findPublishedProductBySlug(query.lang, slug);
}

export async function listPublicApiCategories(
  query: PublicApiListQuery,
): Promise<{ readonly items: PublicSiteCategoryCard[]; readonly meta: PublicApiListMeta }> {
  const [items, total] = await Promise.all([
    findPublishedCategoryCardsPage(query.lang, query.page, query.limit),
    countPublishedCategories(),
  ]);

  return {
    items,
    meta: buildListMeta(query.lang, query.page, query.limit, total),
  };
}

export async function getPublicApiCategory(
  slug: string,
  query: PublicApiDetailQuery,
): Promise<PublicSiteCategoryDetail | null> {
  return findPublishedCategoryBySlug(query.lang, slug);
}

export async function getPublicApiPage(
  slug: string,
  query: PublicApiDetailQuery,
): Promise<PublicSitePageDetail | null> {
  return findPublishedPageBySlug(query.lang, slug);
}

export async function getPublicApiBrand(
  slug: string,
  query: PublicApiDetailQuery,
): Promise<PublicSiteBrandDetail | null> {
  return findPublishedBrandBySlug(query.lang, slug);
}

export async function searchPublicApiCatalog(
  query: PublicApiSearchQuery,
): Promise<PublicApiSearchPayload> {
  const [products, categories, pages, brands] = await Promise.all([
    searchPublishedProducts(query.lang, query.q, query.limit),
    searchPublishedCategories(query.lang, query.q, query.limit),
    searchPublishedPages(query.lang, query.q, query.limit),
    searchPublishedBrands(query.lang, query.q, query.limit),
  ]);

  return {
    query: query.q,
    products,
    categories,
    pages,
    brands,
  };
}

export async function getPublicApiSitemap(query: PublicApiSitemapQuery): Promise<{
  readonly data: PublicApiSitemapPayload;
  readonly meta: PublicApiPaginationMeta;
}> {
  const summary = await getSitemapSummary();

  let entries = summary.entries;

  if (query.lang) {
    entries = entries.filter((entry) => entry.language === query.lang);
  }

  if (query.indexedOnly) {
    entries = entries.filter((entry) => entry.indexed && !entry.excluded);
  }

  const total = entries.length;
  const offset = (query.page - 1) * query.limit;
  const pageEntries = entries.slice(offset, offset + query.limit).map(mapSitemapEntry);

  return {
    data: {
      enabled: summary.enabled,
      autoGenerate: summary.autoGenerate,
      siteUrl: summary.siteUrl,
      sitemapUrl: summary.sitemapUrl,
      totalUrls: summary.totalUrls,
      indexedUrls: summary.indexedUrls,
      excludedUrls: summary.excludedUrls,
      hiddenUrls: summary.hiddenUrls,
      typeStats: summary.typeStats,
      entries: pageEntries,
      generatedAt: summary.generatedAt.toISOString(),
    },
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function listPublicApiSeoProfiles(
  query: PublicApiSeoProfilesQuery,
): Promise<{ readonly items: PublicApiSeoProfileItem[]; readonly meta: PublicApiPaginationMeta }> {
  const result = await findPublicSeoProfilesPage({
    page: query.page,
    pageSize: query.limit,
    language: query.lang,
    ownerType: query.ownerType,
    search: query.search,
  });

  return {
    items: result.items,
    meta: buildPaginationMeta(result.page, result.pageSize, result.total),
  };
}

export async function getPublicApiMedia(id: string): Promise<PublicApiMediaPayload | null> {
  const media = await getMedia(id);

  if (!media?.isPublic) {
    return null;
  }

  return mapPublicMedia(media);
}

function buildListMeta(
  language: PublicSiteLanguage,
  page: number,
  limit: number,
  total: number,
): PublicApiListMeta {
  return {
    language,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
