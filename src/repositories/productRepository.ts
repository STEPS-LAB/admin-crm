import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  ne,
  or,
  type SQL,
} from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  brandTranslations,
  brands,
  categories,
  categoryTranslations,
  productTranslations,
  products,
} from "@/db/schema/catalog";
import { seoAnalysis, seoProfiles } from "@/db/schema/seo";
import { mediaAssets, mediaUsage } from "@/db/schema/storage";
import { buildMediaPublicUrl } from "@/lib/media/publicUrl";
import { calculatePagination, restoreById, softDeleteById, softDeleteFilter, withTransaction } from "@/repositories/baseRepository";

import type { Pagination, PaginationParams } from "@/types";
import type { ProductSortDirection, ProductSortField } from "@/constants/catalog";
import type {
  ProductDetail,
  ProductFormInput,
  ProductFormLookupOption,
  ProductListFilters,
  ProductListItem,
  ProductTranslationInput,
} from "@/types/products";

function buildListWhere(filters: ProductListFilters): SQL | undefined {
  const conditions: SQL[] = [softDeleteFilter(products.deletedAt)];

  if (filters.status) {
    conditions.push(eq(products.status, filters.status));
  }

  if (filters.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }

  if (filters.brandId) {
    conditions.push(eq(products.brandId, filters.brandId));
  }

  if (filters.stockStatus) {
    conditions.push(eq(products.stockStatus, filters.stockStatus));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(productTranslations.name, term),
        ilike(productTranslations.slug, term),
        ilike(products.sku, term),
        ilike(products.barcode, term),
      )!,
    );
  }

  if (filters.qualityFilter === "no-desc") {
    conditions.push(isNull(productTranslations.description));
  }

  if (filters.qualityFilter === "no-short-desc") {
    conditions.push(isNull(productTranslations.shortDescription));
  }

  if (filters.qualityFilter === "no-seo") {
    conditions.push(isNull(seoProfiles.id));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function buildListOrderBy(
  sortBy: ProductSortField | undefined,
  sortDir: ProductSortDirection | undefined,
): SQL[] {
  const direction = sortDir === "asc" ? asc : desc;

  switch (sortBy) {
    case "name":
      return [direction(productTranslations.name)];
    case "price":
      return [direction(products.price)];
    case "sku":
      return [direction(products.sku)];
    case "status":
      return [direction(products.status)];
    case "updatedAt":
      return [direction(products.updatedAt)];
    default:
      return [desc(products.updatedAt)];
  }
}

function listQueryBase() {
  const db = getDb();

  return db
    .select({
      id: products.id,
      sku: products.sku,
      status: products.status,
      price: products.price,
      oldPrice: products.oldPrice,
      currency: products.currency,
      stockStatus: products.stockStatus,
      updatedAt: products.updatedAt,
      name: productTranslations.name,
      slug: productTranslations.slug,
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
    .leftJoin(
      productTranslations,
      and(eq(productTranslations.productId, products.id), eq(productTranslations.language, "uk")),
    )
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(
      categoryTranslations,
      and(eq(categoryTranslations.categoryId, categories.id), eq(categoryTranslations.language, "uk")),
    )
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(
      brandTranslations,
      and(eq(brandTranslations.brandId, brands.id), eq(brandTranslations.language, "uk")),
    )
    .leftJoin(
      seoProfiles,
      and(
        eq(seoProfiles.ownerId, products.id),
        eq(seoProfiles.ownerType, "product"),
        eq(seoProfiles.language, "uk"),
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
    .leftJoin(mediaAssets, eq(mediaUsage.mediaAssetId, mediaAssets.id));
}

export async function findProducts(
  filters: ProductListFilters,
): Promise<Pagination<ProductListItem>> {
  const db = getDb();
  const whereClause = buildListWhere(filters);
  const offset = (filters.page - 1) * filters.pageSize;

  const [rows, totalResult] = await Promise.all([
    listQueryBase()
      .where(whereClause)
      .orderBy(...buildListOrderBy(filters.sortBy, filters.sortDir))
      .limit(filters.pageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.language, "uk")),
      )
      .leftJoin(
        seoProfiles,
        and(
          eq(seoProfiles.ownerId, products.id),
          eq(seoProfiles.ownerType, "product"),
          eq(seoProfiles.language, "uk"),
          isNull(seoProfiles.deletedAt),
        ),
      )
      .where(whereClause),
  ]);

  const items: ProductListItem[] = rows.map((row) => {
    const hasCover =
      row.coverStorageBucket &&
      row.coverStoragePath &&
      row.coverAssetDeleted === false;

    return {
      id: row.id,
      sku: row.sku,
      status: row.status,
      price: row.price,
      oldPrice: row.oldPrice,
      currency: row.currency,
      stockStatus: row.stockStatus,
      updatedAt: row.updatedAt,
      name: row.name ?? "Untitled product",
      slug: row.slug ?? "",
      categoryName: row.categoryName,
      brandName: row.brandName,
      seoScore: row.seoScore,
      coverThumbnailUrl:
        hasCover && row.coverStorageBucket && row.coverStoragePath
          ? buildMediaPublicUrl(row.coverStorageBucket, row.coverStoragePath)
          : null,
      coverAlt: row.coverAltUk ?? row.coverAltEn ?? row.name ?? null,
    };
  });

  const paginationParams: PaginationParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  };

  return calculatePagination(items, totalResult[0]?.value ?? 0, paginationParams);
}

export async function findProductById(id: string): Promise<ProductDetail | null> {
  const db = getDb();

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), softDeleteFilter(products.deletedAt)))
    .limit(1);

  if (!product) {
    return null;
  }

  const translations = await db
    .select()
    .from(productTranslations)
    .where(eq(productTranslations.productId, id));

  const uk = translations.find((row) => row.language === "uk");
  const en = translations.find((row) => row.language === "en");

  if (!uk || !en) {
    return null;
  }

  const [categoryRow] = await db
    .select({ name: categoryTranslations.name })
    .from(categoryTranslations)
    .where(and(eq(categoryTranslations.categoryId, product.categoryId), eq(categoryTranslations.language, "uk")))
    .limit(1);

  let brandName: string | null = null;

  if (product.brandId) {
    const [brandRow] = await db
      .select({ name: brandTranslations.name })
      .from(brandTranslations)
      .where(and(eq(brandTranslations.brandId, product.brandId), eq(brandTranslations.language, "uk")))
      .limit(1);

    brandName = brandRow?.name ?? null;
  }

  const mapTranslation = (row: typeof uk): ProductTranslationInput => ({
    name: row.name,
    slug: row.slug,
    shortDescription: row.shortDescription,
    description: row.description,
  });

  return {
    id: product.id,
    sku: product.sku,
    barcode: product.barcode,
    categoryId: product.categoryId,
    brandId: product.brandId,
    status: product.status,
    price: product.price,
    oldPrice: product.oldPrice,
    currency: product.currency,
    stockQuantity: product.stockQuantity,
    stockStatus: product.stockStatus,
    publishedAt: product.publishedAt,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    translations: {
      uk: mapTranslation(uk),
      en: mapTranslation(en),
    },
    categoryName: categoryRow?.name ?? null,
    brandName,
  };
}

export async function skuExists(sku: string, excludeProductId?: string): Promise<boolean> {
  const db = getDb();
  const conditions: SQL[] = [eq(products.sku, sku), softDeleteFilter(products.deletedAt)];

  if (excludeProductId) {
    conditions.push(ne(products.id, excludeProductId));
  }

  const result = await db
    .select({ value: count() })
    .from(products)
    .where(and(...conditions));

  return (result[0]?.value ?? 0) > 0;
}

export async function slugExists(
  language: "uk" | "en",
  slug: string,
  excludeProductId?: string,
): Promise<boolean> {
  const db = getDb();
  const conditions: SQL[] = [
    eq(productTranslations.language, language),
    eq(productTranslations.slug, slug),
    softDeleteFilter(products.deletedAt),
  ];

  if (excludeProductId) {
    conditions.push(ne(products.id, excludeProductId));
  }

  const result = await db
    .select({ value: count() })
    .from(productTranslations)
    .innerJoin(products, eq(productTranslations.productId, products.id))
    .where(and(...conditions));

  return (result[0]?.value ?? 0) > 0;
}

export async function insertProduct(input: ProductFormInput): Promise<string> {
  return withTransaction(async (tx) => {
    const [created] = await tx
      .insert(products)
      .values({
        sku: input.sku,
        barcode: input.barcode,
        categoryId: input.categoryId,
        brandId: input.brandId,
        status: input.status,
        price: input.price,
        oldPrice: input.oldPrice,
        currency: input.currency,
        stockQuantity: input.stockQuantity,
        stockStatus: input.stockStatus,
        publishedAt: input.status === "published" ? new Date() : null,
      })
      .returning({ id: products.id });

    if (!created) {
      throw new Error("Failed to create product");
    }

    await tx.insert(productTranslations).values([
      {
        productId: created.id,
        language: "uk",
        name: input.translations.uk.name,
        slug: input.translations.uk.slug,
        shortDescription: input.translations.uk.shortDescription,
        description: input.translations.uk.description,
      },
      {
        productId: created.id,
        language: "en",
        name: input.translations.en.name,
        slug: input.translations.en.slug,
        shortDescription: input.translations.en.shortDescription,
        description: input.translations.en.description,
      },
    ]);

    return created.id;
  });
}

export async function updateProductRecord(id: string, input: ProductFormInput): Promise<void> {
  await withTransaction(async (tx) => {
    await tx
      .update(products)
      .set({
        sku: input.sku,
        barcode: input.barcode,
        categoryId: input.categoryId,
        brandId: input.brandId,
        status: input.status,
        price: input.price,
        oldPrice: input.oldPrice,
        currency: input.currency,
        stockQuantity: input.stockQuantity,
        stockStatus: input.stockStatus,
        publishedAt: input.status === "published" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, id), softDeleteFilter(products.deletedAt)));

    for (const language of ["uk", "en"] as const) {
      const translation = input.translations[language];

      await tx
        .update(productTranslations)
        .set({
          name: translation.name,
          slug: translation.slug,
          shortDescription: translation.shortDescription,
          description: translation.description,
          updatedAt: new Date(),
        })
        .where(and(eq(productTranslations.productId, id), eq(productTranslations.language, language)));
    }
  });
}

export async function updateProductStatus(
  id: string,
  status: ProductFormInput["status"],
): Promise<void> {
  const db = getDb();

  await db
    .update(products)
    .set({
      status,
      publishedAt: status === "published" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, id), softDeleteFilter(products.deletedAt)));
}

export async function softDeleteProduct(id: string): Promise<boolean> {
  return softDeleteById(products, products.id, products.deletedAt, id);
}

export async function restoreProductById(id: string): Promise<boolean> {
  return restoreById(products, products.id, products.deletedAt, id);
}

export async function findDeletedProductById(id: string): Promise<ProductDetail | null> {
  const db = getDb();

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), isNotNull(products.deletedAt)))
    .limit(1);

  if (!product) {
    return null;
  }

  const translations = await db
    .select()
    .from(productTranslations)
    .where(eq(productTranslations.productId, id));

  const uk = translations.find((row) => row.language === "uk");
  const en = translations.find((row) => row.language === "en");

  if (!uk || !en) {
    return null;
  }

  const [categoryRow] = await db
    .select({ name: categoryTranslations.name })
    .from(categoryTranslations)
    .where(and(eq(categoryTranslations.categoryId, product.categoryId), eq(categoryTranslations.language, "uk")))
    .limit(1);

  let brandName: string | null = null;

  if (product.brandId) {
    const [brandRow] = await db
      .select({ name: brandTranslations.name })
      .from(brandTranslations)
      .where(and(eq(brandTranslations.brandId, product.brandId), eq(brandTranslations.language, "uk")))
      .limit(1);

    brandName = brandRow?.name ?? null;
  }

  const mapTranslation = (row: typeof uk): ProductTranslationInput => ({
    name: row.name,
    slug: row.slug,
    shortDescription: row.shortDescription,
    description: row.description,
  });

  return {
    id: product.id,
    sku: product.sku,
    barcode: product.barcode,
    categoryId: product.categoryId,
    brandId: product.brandId,
    status: product.status,
    price: product.price,
    oldPrice: product.oldPrice,
    currency: product.currency,
    stockQuantity: product.stockQuantity,
    stockStatus: product.stockStatus,
    publishedAt: product.publishedAt,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    translations: {
      uk: mapTranslation(uk),
      en: mapTranslation(en),
    },
    categoryName: categoryRow?.name ?? null,
    brandName,
  };
}

export async function findCategoryOptions(): Promise<ProductFormLookupOption[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: categories.id,
      label: categoryTranslations.name,
    })
    .from(categories)
    .innerJoin(
      categoryTranslations,
      and(eq(categoryTranslations.categoryId, categories.id), eq(categoryTranslations.language, "uk")),
    )
    .where(softDeleteFilter(categories.deletedAt))
    .orderBy(categoryTranslations.name);

  return rows;
}

export async function findBrandOptions(): Promise<ProductFormLookupOption[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: brands.id,
      label: brandTranslations.name,
    })
    .from(brands)
    .innerJoin(
      brandTranslations,
      and(eq(brandTranslations.brandId, brands.id), eq(brandTranslations.language, "uk")),
    )
    .where(softDeleteFilter(brands.deletedAt))
    .orderBy(brandTranslations.name);

  return rows;
}
