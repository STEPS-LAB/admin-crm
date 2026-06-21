import { and, count, desc, eq, ilike, inArray, isNull, or, sql, type SQL } from "drizzle-orm";

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
import { metadata, seoAnalysis, seoProfiles } from "@/db/schema/seo";
import { mediaAssets, mediaUsage } from "@/db/schema/storage";
import { buildMediaPublicUrl } from "@/lib/media/publicUrl";
import { calculatePagination, softDeleteFilter } from "@/repositories/baseRepository";


import type { Pagination, PaginationParams } from "@/types";
import type {
  PublicApiSearchBrandResult,
  PublicApiSearchPageResult,
  PublicApiSeoProfileItem,
} from "@/types/public-api";
import type {
  PublicSiteCategoryCard,
  PublicSiteLanguage,
  PublicSiteProductCard,
} from "@/types/public-site";

type PublicApiCatalogOwnerType = (typeof import("@/schemas/api/publicApiSchemas").PUBLIC_API_CATALOG_OWNER_TYPES)[number];

export interface PublicApiSeoProfileFilters {
  readonly page: number;
  readonly pageSize: number;
  readonly language?: PublicSiteLanguage | undefined;
  readonly ownerType?: PublicApiCatalogOwnerType | undefined;
  readonly search?: string | undefined;
}

const PUBLIC_CATALOG_OWNER_TYPES = ["product", "category", "page", "brand"] as const;

function publishedProductConditions(language: PublicSiteLanguage): SQL {
  return and(
    softDeleteFilter(products.deletedAt),
    eq(products.status, "published"),
    eq(productTranslations.language, language),
  )!;
}

function publishedCategoryConditions(language: PublicSiteLanguage): SQL {
  return and(
    softDeleteFilter(categories.deletedAt),
    eq(categories.status, "published"),
    eq(categoryTranslations.language, language),
  )!;
}

function publishedPageConditions(language: PublicSiteLanguage): SQL {
  return and(
    softDeleteFilter(pages.deletedAt),
    eq(pages.status, "published"),
    eq(pageTranslations.language, language),
  )!;
}

function publishedBrandConditions(language: PublicSiteLanguage): SQL {
  return and(
    softDeleteFilter(brands.deletedAt),
    eq(brands.status, "published"),
    eq(brandTranslations.language, language),
  )!;
}

function publishedOwnerCondition(): SQL {
  return or(
    and(
      eq(seoProfiles.ownerType, "product"),
      softDeleteFilter(products.deletedAt),
      eq(products.status, "published"),
    ),
    and(
      eq(seoProfiles.ownerType, "category"),
      softDeleteFilter(categories.deletedAt),
      eq(categories.status, "published"),
    ),
    and(
      eq(seoProfiles.ownerType, "page"),
      softDeleteFilter(pages.deletedAt),
      eq(pages.status, "published"),
    ),
    and(
      eq(seoProfiles.ownerType, "brand"),
      softDeleteFilter(brands.deletedAt),
      eq(brands.status, "published"),
    ),
  )!;
}

function buildPublicSeoProfileWhere(filters: PublicApiSeoProfileFilters): SQL {
  const conditions: SQL[] = [
    isNull(seoProfiles.deletedAt),
    inArray(seoProfiles.ownerType, PUBLIC_CATALOG_OWNER_TYPES),
    publishedOwnerCondition(),
  ];

  if (filters.ownerType) {
    conditions.push(eq(seoProfiles.ownerType, filters.ownerType));
  }

  if (filters.language) {
    conditions.push(eq(seoProfiles.language, filters.language));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(metadata.metaTitle, term),
        ilike(metadata.metaDescription, term),
        ilike(productTranslations.name, term),
        ilike(categoryTranslations.name, term),
        ilike(pageTranslations.title, term),
        ilike(brandTranslations.name, term),
      )!,
    );
  }

  return and(...conditions)!;
}

function mapSearchProductCard(
  row: {
    id: string;
    name: string | null;
    slug: string | null;
    shortDescription: string | null;
    price: string;
    currency: string;
    categoryName: string | null;
    brandName: string | null;
    seoScore: number | null;
    coverStorageBucket: string | null;
    coverStoragePath: string | null;
    coverAltUk: string | null;
    coverAltEn: string | null;
    coverAssetDeleted: boolean | null;
  },
  language: PublicSiteLanguage,
): PublicSiteProductCard {
  const hasCover =
    row.coverStorageBucket && row.coverStoragePath && row.coverAssetDeleted === false;

  return {
    id: row.id,
    name: row.name ?? "Untitled product",
    slug: row.slug ?? "",
    shortDescription: row.shortDescription,
    price: row.price,
    currency: row.currency,
    categoryName: row.categoryName,
    brandName: row.brandName,
    seoScore: row.seoScore,
    coverThumbnailUrl:
      hasCover && row.coverStorageBucket && row.coverStoragePath
        ? buildMediaPublicUrl(row.coverStorageBucket, row.coverStoragePath)
        : null,
    coverAlt: (language === "uk" ? row.coverAltUk : row.coverAltEn) ?? row.name ?? null,
  };
}

export async function searchPublishedProducts(
  language: PublicSiteLanguage,
  query: string,
  limit: number,
): Promise<PublicSiteProductCard[]> {
  const db = getDb();
  const term = `%${query}%`;

  const rows = await db
    .select({
      id: products.id,
      name: productTranslations.name,
      slug: productTranslations.slug,
      shortDescription: productTranslations.shortDescription,
      price: products.price,
      currency: products.currency,
      categoryName: categoryTranslations.name,
      brandName: brandTranslations.name,
      seoScore: seoAnalysis.overallScore,
      coverStorageBucket: mediaAssets.storageBucket,
      coverStoragePath: mediaAssets.storagePath,
      coverAltUk: mediaAssets.altUk,
      coverAltEn: mediaAssets.altEn,
      coverAssetDeleted: mediaAssets.isDeleted,
    })
    .from(products)
    .innerJoin(
      productTranslations,
      and(eq(productTranslations.productId, products.id), eq(productTranslations.language, language)),
    )
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(
      categoryTranslations,
      and(
        eq(categoryTranslations.categoryId, categories.id),
        eq(categoryTranslations.language, language),
      ),
    )
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(
      brandTranslations,
      and(eq(brandTranslations.brandId, brands.id), eq(brandTranslations.language, language)),
    )
    .leftJoin(
      seoProfiles,
      and(
        eq(seoProfiles.ownerId, products.id),
        eq(seoProfiles.ownerType, "product"),
        eq(seoProfiles.language, language),
        isNull(seoProfiles.deletedAt),
      ),
    )
    .leftJoin(seoAnalysis, eq(seoAnalysis.seoProfileId, seoProfiles.id))
    .leftJoin(
      mediaUsage,
      and(
        eq(mediaUsage.ownerId, products.id),
        eq(mediaUsage.ownerType, "product"),
        eq(mediaUsage.usageType, "cover"),
      ),
    )
    .leftJoin(mediaAssets, eq(mediaUsage.mediaAssetId, mediaAssets.id))
    .where(
      and(
        publishedProductConditions(language),
        or(
          ilike(productTranslations.name, term),
          ilike(productTranslations.slug, term),
          ilike(productTranslations.shortDescription, term),
          ilike(products.sku, term),
          ilike(products.barcode, term),
        ),
      ),
    )
    .orderBy(desc(products.updatedAt))
    .limit(limit);

  return rows.map((row) => mapSearchProductCard(row, language));
}

export async function searchPublishedCategories(
  language: PublicSiteLanguage,
  query: string,
  limit: number,
): Promise<PublicSiteCategoryCard[]> {
  const db = getDb();
  const term = `%${query}%`;

  const rows = await db
    .select({
      id: categories.id,
      name: categoryTranslations.name,
      slug: categoryTranslations.slug,
      description: categoryTranslations.description,
      productCount: sql<number>`(
        select count(*)::int from ${products}
        where ${products.categoryId} = ${categories.id}
        and ${products.deletedAt} is null
        and ${products.status} = 'published'
      )`,
      seoScore: seoAnalysis.overallScore,
      coverStorageBucket: mediaAssets.storageBucket,
      coverStoragePath: mediaAssets.storagePath,
      coverAltUk: mediaAssets.altUk,
      coverAltEn: mediaAssets.altEn,
      coverAssetDeleted: mediaAssets.isDeleted,
    })
    .from(categories)
    .innerJoin(
      categoryTranslations,
      and(
        eq(categoryTranslations.categoryId, categories.id),
        eq(categoryTranslations.language, language),
      ),
    )
    .leftJoin(
      seoProfiles,
      and(
        eq(seoProfiles.ownerId, categories.id),
        eq(seoProfiles.ownerType, "category"),
        eq(seoProfiles.language, language),
        isNull(seoProfiles.deletedAt),
      ),
    )
    .leftJoin(seoAnalysis, eq(seoAnalysis.seoProfileId, seoProfiles.id))
    .leftJoin(
      mediaUsage,
      and(
        eq(mediaUsage.ownerId, categories.id),
        eq(mediaUsage.ownerType, "category"),
        eq(mediaUsage.usageType, "cover"),
      ),
    )
    .leftJoin(mediaAssets, eq(mediaUsage.mediaAssetId, mediaAssets.id))
    .where(
      and(
        publishedCategoryConditions(language),
        or(
          ilike(categoryTranslations.name, term),
          ilike(categoryTranslations.slug, term),
          ilike(categoryTranslations.description, term),
        ),
      ),
    )
    .orderBy(categories.sortOrder, desc(categories.updatedAt))
    .limit(limit);

  return rows.map((row) => {
    const hasCover =
      row.coverStorageBucket && row.coverStoragePath && row.coverAssetDeleted === false;

    return {
      id: row.id,
      name: row.name ?? "Untitled category",
      slug: row.slug ?? "",
      description: row.description,
      productCount: Number(row.productCount),
      seoScore: row.seoScore,
      coverThumbnailUrl:
        hasCover && row.coverStorageBucket && row.coverStoragePath
          ? buildMediaPublicUrl(row.coverStorageBucket, row.coverStoragePath)
          : null,
      coverAlt: (language === "uk" ? row.coverAltUk : row.coverAltEn) ?? row.name ?? null,
    };
  });
}

export async function searchPublishedPages(
  language: PublicSiteLanguage,
  query: string,
  limit: number,
): Promise<PublicApiSearchPageResult[]> {
  const db = getDb();
  const term = `%${query}%`;

  const rows = await db
    .select({
      id: pages.id,
      title: pageTranslations.title,
      slug: pageTranslations.slug,
      excerpt: pageTranslations.excerpt,
    })
    .from(pages)
    .innerJoin(
      pageTranslations,
      and(eq(pageTranslations.pageId, pages.id), eq(pageTranslations.language, language)),
    )
    .where(
      and(
        publishedPageConditions(language),
        or(
          ilike(pageTranslations.title, term),
          ilike(pageTranslations.slug, term),
          ilike(pageTranslations.excerpt, term),
        ),
      ),
    )
    .orderBy(desc(pages.updatedAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    title: row.title ?? "Untitled page",
    slug: row.slug ?? "",
    excerpt: row.excerpt,
  }));
}

export async function searchPublishedBrands(
  language: PublicSiteLanguage,
  query: string,
  limit: number,
): Promise<PublicApiSearchBrandResult[]> {
  const db = getDb();
  const term = `%${query}%`;

  const rows = await db
    .select({
      id: brands.id,
      name: brandTranslations.name,
      slug: brands.slug,
    })
    .from(brands)
    .innerJoin(
      brandTranslations,
      and(eq(brandTranslations.brandId, brands.id), eq(brandTranslations.language, language)),
    )
    .where(
      and(
        publishedBrandConditions(language),
        or(ilike(brandTranslations.name, term), ilike(brands.slug, term)),
      ),
    )
    .orderBy(desc(brands.updatedAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    name: row.name ?? "Untitled brand",
    slug: row.slug ?? "",
  }));
}

export async function findPublicSeoProfilesPage(
  filters: PublicApiSeoProfileFilters,
): Promise<Pagination<PublicApiSeoProfileItem>> {
  const db = getDb();
  const whereClause = buildPublicSeoProfileWhere(filters);
  const offset = (filters.page - 1) * filters.pageSize;

  const rows = await db
    .select({
      id: seoProfiles.id,
      ownerType: seoProfiles.ownerType,
      ownerId: seoProfiles.ownerId,
      language: seoProfiles.language,
      isIndexable: seoProfiles.isIndexable,
      updatedAt: seoProfiles.updatedAt,
      metaTitle: metadata.metaTitle,
      metaDescription: metadata.metaDescription,
      overallScore: seoAnalysis.overallScore,
      productName: productTranslations.name,
      categoryName: categoryTranslations.name,
      pageTitle: pageTranslations.title,
      brandName: brandTranslations.name,
    })
    .from(seoProfiles)
    .leftJoin(metadata, eq(metadata.seoProfileId, seoProfiles.id))
    .leftJoin(seoAnalysis, eq(seoAnalysis.seoProfileId, seoProfiles.id))
    .leftJoin(
      products,
      and(eq(seoProfiles.ownerType, "product"), eq(seoProfiles.ownerId, products.id)),
    )
    .leftJoin(
      productTranslations,
      and(
        eq(productTranslations.productId, products.id),
        eq(productTranslations.language, seoProfiles.language),
      ),
    )
    .leftJoin(
      categories,
      and(eq(seoProfiles.ownerType, "category"), eq(seoProfiles.ownerId, categories.id)),
    )
    .leftJoin(
      categoryTranslations,
      and(
        eq(categoryTranslations.categoryId, categories.id),
        eq(categoryTranslations.language, seoProfiles.language),
      ),
    )
    .leftJoin(
      pages,
      and(eq(seoProfiles.ownerType, "page"), eq(seoProfiles.ownerId, pages.id)),
    )
    .leftJoin(
      pageTranslations,
      and(
        eq(pageTranslations.pageId, pages.id),
        eq(pageTranslations.language, seoProfiles.language),
      ),
    )
    .leftJoin(
      brands,
      and(eq(seoProfiles.ownerType, "brand"), eq(seoProfiles.ownerId, brands.id)),
    )
    .leftJoin(
      brandTranslations,
      and(
        eq(brandTranslations.brandId, brands.id),
        eq(brandTranslations.language, seoProfiles.language),
      ),
    )
    .where(whereClause)
    .orderBy(desc(seoProfiles.updatedAt))
    .limit(filters.pageSize)
    .offset(offset);

  const totalResult = await db
    .select({ value: count() })
    .from(seoProfiles)
    .leftJoin(metadata, eq(metadata.seoProfileId, seoProfiles.id))
    .leftJoin(
      products,
      and(eq(seoProfiles.ownerType, "product"), eq(seoProfiles.ownerId, products.id)),
    )
    .leftJoin(
      productTranslations,
      and(
        eq(productTranslations.productId, products.id),
        eq(productTranslations.language, seoProfiles.language),
      ),
    )
    .leftJoin(
      categories,
      and(eq(seoProfiles.ownerType, "category"), eq(seoProfiles.ownerId, categories.id)),
    )
    .leftJoin(
      categoryTranslations,
      and(
        eq(categoryTranslations.categoryId, categories.id),
        eq(categoryTranslations.language, seoProfiles.language),
      ),
    )
    .leftJoin(
      pages,
      and(eq(seoProfiles.ownerType, "page"), eq(seoProfiles.ownerId, pages.id)),
    )
    .leftJoin(
      pageTranslations,
      and(
        eq(pageTranslations.pageId, pages.id),
        eq(pageTranslations.language, seoProfiles.language),
      ),
    )
    .leftJoin(
      brands,
      and(eq(seoProfiles.ownerType, "brand"), eq(seoProfiles.ownerId, brands.id)),
    )
    .leftJoin(
      brandTranslations,
      and(
        eq(brandTranslations.brandId, brands.id),
        eq(brandTranslations.language, seoProfiles.language),
      ),
    )
    .where(whereClause);

  const items: PublicApiSeoProfileItem[] = rows
    .filter(
      (
        row,
      ): row is typeof row & {
        ownerType: PublicApiCatalogOwnerType;
        language: PublicSiteLanguage;
      } =>
        PUBLIC_CATALOG_OWNER_TYPES.includes(row.ownerType as PublicApiCatalogOwnerType) &&
        (row.language === "uk" || row.language === "en"),
    )
    .map((row) => ({
      id: row.id,
      ownerType: row.ownerType,
      ownerId: row.ownerId,
      language: row.language,
      entityLabel:
        row.productName ??
        row.categoryName ??
        row.pageTitle ??
        row.brandName ??
        `${row.ownerType} ${row.ownerId.slice(0, 8)}`,
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      overallScore: row.overallScore,
      isIndexable: row.isIndexable,
      updatedAt: row.updatedAt.toISOString(),
    }));

  const paginationParams: PaginationParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  };

  return calculatePagination(items, totalResult[0]?.value ?? 0, paginationParams);
}
