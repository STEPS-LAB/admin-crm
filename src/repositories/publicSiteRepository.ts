import { and, count, desc, eq, isNull, sql } from "drizzle-orm";

import { getDb, withDbRetry } from "@/db/client";
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
import { softDeleteFilter } from "@/repositories/baseRepository";

import type {
  PublicSiteBrandDetail,
  PublicSiteCatalogStats,
  PublicSiteCategoryCard,
  PublicSiteCategoryDetail,
  PublicSiteHomepageContent,
  PublicSiteLanguage,
  PublicSitePageDetail,
  PublicSiteProductCard,
  PublicSiteProductDetail,
  PublicSiteSeoMetadata,
} from "@/types/public-site";

function publishedProductConditions(language: PublicSiteLanguage) {
  return and(
    softDeleteFilter(products.deletedAt),
    eq(products.status, "published"),
    eq(productTranslations.language, language),
  );
}

function publishedCategoryConditions(language: PublicSiteLanguage) {
  return and(
    softDeleteFilter(categories.deletedAt),
    eq(categories.status, "published"),
    eq(categoryTranslations.language, language),
  );
}

function publishedBrandConditions(language: PublicSiteLanguage) {
  return and(
    softDeleteFilter(brands.deletedAt),
    eq(brands.status, "published"),
    eq(brandTranslations.language, language),
  );
}

function publishedPageConditions(language: PublicSiteLanguage) {
  return and(
    softDeleteFilter(pages.deletedAt),
    eq(pages.status, "published"),
    eq(pageTranslations.language, language),
  );
}

function mapSeoMetadata(
  row:
    | {
        metaTitle: string | null;
        metaDescription: string | null;
        overallScore: number | null;
      }
    | undefined,
): PublicSiteSeoMetadata | null {
  if (!row) {
    return null;
  }

  return {
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    overallScore: row.overallScore,
  };
}

function mapProductCard(
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

export async function findPublishedHomepageContent(
  language: PublicSiteLanguage,
): Promise<PublicSiteHomepageContent | null> {
  const db = getDb();

  const [row] = await db
    .select({
      title: pageTranslations.title,
      slug: pageTranslations.slug,
      excerpt: pageTranslations.excerpt,
      content: pageTranslations.content,
    })
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

  if (!row) {
    return null;
  }

  return {
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
  };
}

export async function findPublishedProductCards(
  language: PublicSiteLanguage,
  limit: number,
): Promise<PublicSiteProductCard[]> {
  const db = getDb();

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
      and(
        eq(productTranslations.productId, products.id),
        eq(productTranslations.language, language),
      ),
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
    .where(publishedProductConditions(language))
    .orderBy(desc(products.updatedAt))
    .limit(limit);

  return rows.map((row) => mapProductCard(row, language));
}

export async function countPublishedProducts(): Promise<number> {
  const db = getDb();

  const [row] = await db
    .select({ value: count() })
    .from(products)
    .where(and(softDeleteFilter(products.deletedAt), eq(products.status, "published")));

  return Number(row?.value ?? 0);
}

export async function findPublishedProductCardsPage(
  language: PublicSiteLanguage,
  page: number,
  limit: number,
): Promise<PublicSiteProductCard[]> {
  const db = getDb();
  const offset = (page - 1) * limit;

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
      and(
        eq(productTranslations.productId, products.id),
        eq(productTranslations.language, language),
      ),
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
    .where(publishedProductConditions(language))
    .orderBy(desc(products.updatedAt))
    .limit(limit)
    .offset(offset);

  return rows.map((row) => mapProductCard(row, language));
}

export async function findPublishedCategoryCards(
  language: PublicSiteLanguage,
  limit: number,
): Promise<PublicSiteCategoryCard[]> {
  const db = getDb();

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
    .where(publishedCategoryConditions(language))
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

export async function countPublishedCategories(): Promise<number> {
  const db = getDb();

  const [row] = await db
    .select({ value: count() })
    .from(categories)
    .where(and(softDeleteFilter(categories.deletedAt), eq(categories.status, "published")));

  return Number(row?.value ?? 0);
}

export async function findPublishedCategoryCardsPage(
  language: PublicSiteLanguage,
  page: number,
  limit: number,
): Promise<PublicSiteCategoryCard[]> {
  const db = getDb();
  const offset = (page - 1) * limit;

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
    .where(publishedCategoryConditions(language))
    .orderBy(categories.sortOrder, desc(categories.updatedAt))
    .limit(limit)
    .offset(offset);

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

export async function findPublishedProductBySlug(
  language: PublicSiteLanguage,
  slug: string,
): Promise<PublicSiteProductDetail | null> {
  return withDbRetry(async (db) => {
    const [row] = await db
      .select({
        id: products.id,
        sku: products.sku,
        name: productTranslations.name,
        slug: productTranslations.slug,
        shortDescription: productTranslations.shortDescription,
        description: productTranslations.description,
        price: products.price,
        oldPrice: products.oldPrice,
        currency: products.currency,
        stockStatus: products.stockStatus,
        categoryName: categoryTranslations.name,
        categorySlug: categoryTranslations.slug,
        brandName: brandTranslations.name,
        brandSlug: brands.slug,
        seoScore: seoAnalysis.overallScore,
        metaTitle: metadata.metaTitle,
        metaDescription: metadata.metaDescription,
        coverStorageBucket: mediaAssets.storageBucket,
        coverStoragePath: mediaAssets.storagePath,
        coverAltUk: mediaAssets.altUk,
        coverAltEn: mediaAssets.altEn,
        coverAssetDeleted: mediaAssets.isDeleted,
      })
      .from(products)
      .innerJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.language, language),
        ),
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
      .leftJoin(metadata, eq(metadata.seoProfileId, seoProfiles.id))
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
      .where(and(publishedProductConditions(language), eq(productTranslations.slug, slug)))
      .limit(1);

    if (!row) {
      return null;
    }

    const card = mapProductCard(row, language);

    return {
      ...card,
      description: row.description,
      oldPrice: row.oldPrice,
      stockStatus: row.stockStatus,
      sku: row.sku,
      categorySlug: row.categorySlug,
      brandSlug: row.brandSlug,
      seo: mapSeoMetadata({
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        overallScore: row.seoScore,
      }),
    };
  });
}

export async function findPublishedProductsForCategory(
  language: PublicSiteLanguage,
  categoryId: string,
  limit: number,
): Promise<PublicSiteProductCard[]> {
  const db = getDb();

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
      and(
        eq(productTranslations.productId, products.id),
        eq(productTranslations.language, language),
      ),
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
    .where(and(publishedProductConditions(language), eq(products.categoryId, categoryId)))
    .orderBy(desc(products.updatedAt))
    .limit(limit);

  return rows.map((row) => mapProductCard(row, language));
}

export async function findPublishedCategoryBySlug(
  language: PublicSiteLanguage,
  slug: string,
): Promise<PublicSiteCategoryDetail | null> {
  const db = getDb();

  const [row] = await db
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
      metaTitle: metadata.metaTitle,
      metaDescription: metadata.metaDescription,
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
    .leftJoin(metadata, eq(metadata.seoProfileId, seoProfiles.id))
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
    .where(and(publishedCategoryConditions(language), eq(categoryTranslations.slug, slug)))
    .limit(1);

  if (!row) {
    return null;
  }

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
    seo: mapSeoMetadata({
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      overallScore: row.seoScore,
    }),
  };
}

export async function findPublishedPageBySlug(
  language: PublicSiteLanguage,
  slug: string,
): Promise<PublicSitePageDetail | null> {
  const db = getDb();

  const [row] = await db
    .select({
      id: pages.id,
      title: pageTranslations.title,
      slug: pageTranslations.slug,
      excerpt: pageTranslations.excerpt,
      content: pageTranslations.content,
      pageType: pages.pageType,
      seoScore: seoAnalysis.overallScore,
      metaTitle: metadata.metaTitle,
      metaDescription: metadata.metaDescription,
    })
    .from(pages)
    .innerJoin(pageTranslations, eq(pageTranslations.pageId, pages.id))
    .leftJoin(
      seoProfiles,
      and(
        eq(seoProfiles.ownerId, pages.id),
        eq(seoProfiles.ownerType, "page"),
        eq(seoProfiles.language, language),
        isNull(seoProfiles.deletedAt),
      ),
    )
    .leftJoin(metadata, eq(metadata.seoProfileId, seoProfiles.id))
    .leftJoin(seoAnalysis, eq(seoAnalysis.seoProfileId, seoProfiles.id))
    .where(and(publishedPageConditions(language), eq(pageTranslations.slug, slug)))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    pageType: row.pageType,
    seo: mapSeoMetadata({
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      overallScore: row.seoScore,
    }),
  };
}

export async function findPublishedBrandBySlug(
  language: PublicSiteLanguage,
  slug: string,
): Promise<PublicSiteBrandDetail | null> {
  return withDbRetry(async (db) => {
    const [row] = await db
      .select({
        id: brands.id,
        slug: brands.slug,
        name: brandTranslations.name,
        description: brandTranslations.description,
        website: brands.website,
        country: brands.country,
        seoScore: seoAnalysis.overallScore,
        metaTitle: metadata.metaTitle,
        metaDescription: metadata.metaDescription,
        coverStorageBucket: mediaAssets.storageBucket,
        coverStoragePath: mediaAssets.storagePath,
        coverAltUk: mediaAssets.altUk,
        coverAltEn: mediaAssets.altEn,
        coverAssetDeleted: mediaAssets.isDeleted,
      })
      .from(brands)
      .innerJoin(
        brandTranslations,
        and(eq(brandTranslations.brandId, brands.id), eq(brandTranslations.language, language)),
      )
      .leftJoin(
        seoProfiles,
        and(
          eq(seoProfiles.ownerId, brands.id),
          eq(seoProfiles.ownerType, "brand"),
          eq(seoProfiles.language, language),
          isNull(seoProfiles.deletedAt),
        ),
      )
      .leftJoin(metadata, eq(metadata.seoProfileId, seoProfiles.id))
      .leftJoin(seoAnalysis, eq(seoAnalysis.seoProfileId, seoProfiles.id))
      .leftJoin(
        mediaUsage,
        and(
          eq(mediaUsage.ownerId, brands.id),
          eq(mediaUsage.ownerType, "brand"),
          eq(mediaUsage.usageType, "cover"),
        ),
      )
      .leftJoin(mediaAssets, eq(mediaUsage.mediaAssetId, mediaAssets.id))
      .where(and(publishedBrandConditions(language), eq(brands.slug, slug)))
      .limit(1);

    if (!row) {
      return null;
    }

    const hasCover =
      row.coverStorageBucket && row.coverStoragePath && row.coverAssetDeleted === false;

    return {
      id: row.id,
      name: row.name ?? "Untitled brand",
      slug: row.slug,
      description: row.description,
      website: row.website,
      country: row.country,
      coverThumbnailUrl:
        hasCover && row.coverStorageBucket && row.coverStoragePath
          ? buildMediaPublicUrl(row.coverStorageBucket, row.coverStoragePath)
          : null,
      coverAlt: (language === "uk" ? row.coverAltUk : row.coverAltEn) ?? row.name ?? null,
      seo: mapSeoMetadata({
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        overallScore: row.seoScore,
      }),
    };
  });
}

export async function findPublicCatalogStats(): Promise<PublicSiteCatalogStats> {
  const db = getDb();

  const [productCount, categoryCount, pageCount, brandCount] = await Promise.all([
    db
      .select({ value: count() })
      .from(products)
      .where(and(softDeleteFilter(products.deletedAt), eq(products.status, "published"))),
    db
      .select({ value: count() })
      .from(categories)
      .where(and(softDeleteFilter(categories.deletedAt), eq(categories.status, "published"))),
    db
      .select({ value: count() })
      .from(pages)
      .where(and(softDeleteFilter(pages.deletedAt), eq(pages.status, "published"))),
    db
      .select({ value: count() })
      .from(brands)
      .where(and(softDeleteFilter(brands.deletedAt), eq(brands.status, "published"))),
  ]);

  return {
    publishedProducts: productCount[0]?.value ?? 0,
    publishedCategories: categoryCount[0]?.value ?? 0,
    publishedPages: pageCount[0]?.value ?? 0,
    publishedBrands: brandCount[0]?.value ?? 0,
  };
}
