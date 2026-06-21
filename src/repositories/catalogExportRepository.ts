import { and, asc, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  brands,
  categories,
  categoryTranslations,
  productTranslations,
  products,
} from "@/db/schema";
import { softDeleteFilter } from "@/repositories/baseRepository";

export interface ProductExportRow {
  readonly sku: string;
  readonly barcode: string | null;
  readonly categorySlug: string;
  readonly brandSlug: string | null;
  readonly status: string;
  readonly price: string;
  readonly oldPrice: string | null;
  readonly currency: string;
  readonly stockQuantity: number;
  readonly stockStatus: string;
  readonly nameUk: string;
  readonly slugUk: string;
  readonly shortDescriptionUk: string | null;
  readonly descriptionUk: string | null;
  readonly nameEn: string;
  readonly slugEn: string;
  readonly shortDescriptionEn: string | null;
  readonly descriptionEn: string | null;
}

export interface CategoryExportRow {
  readonly parentSlug: string | null;
  readonly sortOrder: number;
  readonly status: string;
  readonly nameUk: string;
  readonly slugUk: string;
  readonly descriptionUk: string | null;
  readonly nameEn: string;
  readonly slugEn: string;
  readonly descriptionEn: string | null;
}

export async function findProductsForExport(): Promise<readonly ProductExportRow[]> {
  const db = getDb();

  const productRows = await db
    .select({
      id: products.id,
      sku: products.sku,
      barcode: products.barcode,
      status: products.status,
      price: products.price,
      oldPrice: products.oldPrice,
      currency: products.currency,
      stockQuantity: products.stockQuantity,
      stockStatus: products.stockStatus,
      categoryId: products.categoryId,
      brandId: products.brandId,
    })
    .from(products)
    .where(softDeleteFilter(products.deletedAt))
    .orderBy(asc(products.sku));

  const results: ProductExportRow[] = [];

  for (const product of productRows) {
    const [categorySlugRow, brandSlugRow, ukTranslation, enTranslation] = await Promise.all([
      db
        .select({ slug: categoryTranslations.slug })
        .from(categoryTranslations)
        .where(
          and(eq(categoryTranslations.categoryId, product.categoryId), eq(categoryTranslations.language, "uk")),
        )
        .limit(1),
      product.brandId
        ? db
            .select({ slug: brands.slug })
            .from(brands)
            .where(and(eq(brands.id, product.brandId), softDeleteFilter(brands.deletedAt)))
            .limit(1)
        : Promise.resolve([]),
      db
        .select()
        .from(productTranslations)
        .where(and(eq(productTranslations.productId, product.id), eq(productTranslations.language, "uk")))
        .limit(1),
      db
        .select()
        .from(productTranslations)
        .where(and(eq(productTranslations.productId, product.id), eq(productTranslations.language, "en")))
        .limit(1),
    ]);

    const uk = ukTranslation[0];
    const en = enTranslation[0];

    if (!uk || !en || !categorySlugRow[0]?.slug) {
      continue;
    }

    results.push({
      sku: product.sku,
      barcode: product.barcode,
      categorySlug: categorySlugRow[0].slug,
      brandSlug: brandSlugRow[0]?.slug ?? null,
      status: product.status,
      price: product.price,
      oldPrice: product.oldPrice,
      currency: product.currency,
      stockQuantity: product.stockQuantity,
      stockStatus: product.stockStatus,
      nameUk: uk.name,
      slugUk: uk.slug,
      shortDescriptionUk: uk.shortDescription,
      descriptionUk: uk.description,
      nameEn: en.name,
      slugEn: en.slug,
      shortDescriptionEn: en.shortDescription,
      descriptionEn: en.description,
    });
  }

  return results;
}

export async function findCategoriesForExport(): Promise<readonly CategoryExportRow[]> {
  const db = getDb();

  const categoryRows = await db
    .select({
      id: categories.id,
      parentId: categories.parentId,
      sortOrder: categories.sortOrder,
      status: categories.status,
    })
    .from(categories)
    .where(softDeleteFilter(categories.deletedAt))
    .orderBy(asc(categories.sortOrder));

  const results: CategoryExportRow[] = [];

  for (const category of categoryRows) {
    const [parentSlugRow, ukTranslation, enTranslation] = await Promise.all([
      category.parentId
        ? db
            .select({ slug: categoryTranslations.slug })
            .from(categoryTranslations)
            .where(
              and(
                eq(categoryTranslations.categoryId, category.parentId),
                eq(categoryTranslations.language, "uk"),
              ),
            )
            .limit(1)
        : Promise.resolve([]),
      db
        .select()
        .from(categoryTranslations)
        .where(
          and(eq(categoryTranslations.categoryId, category.id), eq(categoryTranslations.language, "uk")),
        )
        .limit(1),
      db
        .select()
        .from(categoryTranslations)
        .where(
          and(eq(categoryTranslations.categoryId, category.id), eq(categoryTranslations.language, "en")),
        )
        .limit(1),
    ]);

    const uk = ukTranslation[0];
    const en = enTranslation[0];

    if (!uk || !en) {
      continue;
    }

    results.push({
      parentSlug: parentSlugRow[0]?.slug ?? null,
      sortOrder: category.sortOrder,
      status: category.status,
      nameUk: uk.name,
      slugUk: uk.slug,
      descriptionUk: uk.description,
      nameEn: en.name,
      slugEn: en.slug,
      descriptionEn: en.description,
    });
  }

  return results;
}

export async function findCategoryIdBySlug(
  language: "uk" | "en",
  slug: string,
): Promise<string | null> {
  const db = getDb();

  const [row] = await db
    .select({ categoryId: categoryTranslations.categoryId })
    .from(categoryTranslations)
    .innerJoin(categories, eq(categoryTranslations.categoryId, categories.id))
    .where(
      and(
        eq(categoryTranslations.language, language),
        eq(categoryTranslations.slug, slug),
        isNull(categories.deletedAt),
      ),
    )
    .limit(1);

  return row?.categoryId ?? null;
}

export async function findBrandIdBySlug(slug: string): Promise<string | null> {
  const db = getDb();

  const [row] = await db
    .select({ id: brands.id })
    .from(brands)
    .where(and(eq(brands.slug, slug), softDeleteFilter(brands.deletedAt)))
    .limit(1);

  return row?.id ?? null;
}

export async function findProductIdBySku(sku: string): Promise<string | null> {
  const db = getDb();

  const [row] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.sku, sku), softDeleteFilter(products.deletedAt)))
    .limit(1);

  return row?.id ?? null;
}

export async function findCategoryIdByUkSlug(slug: string): Promise<string | null> {
  return findCategoryIdBySlug("uk", slug);
}
