import { and, desc, eq, isNotNull } from "drizzle-orm";

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

import type { CatalogTrashListItem } from "@/types/catalog-trash";

const CATALOG_TRASH_LIST_LIMIT = 100;

export async function findCatalogTrashItems(): Promise<CatalogTrashListItem[]> {
  const db = getDb();

  const [productRows, categoryRows, pageRows, brandRows] = await Promise.all([
    db
      .select({
        id: products.id,
        sku: products.sku,
        name: productTranslations.name,
        deletedAt: products.deletedAt,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.language, "uk")),
      )
      .where(isNotNull(products.deletedAt))
      .orderBy(desc(products.deletedAt))
      .limit(CATALOG_TRASH_LIST_LIMIT),
    db
      .select({
        id: categories.id,
        name: categoryTranslations.name,
        slug: categoryTranslations.slug,
        deletedAt: categories.deletedAt,
      })
      .from(categories)
      .leftJoin(
        categoryTranslations,
        and(eq(categoryTranslations.categoryId, categories.id), eq(categoryTranslations.language, "uk")),
      )
      .where(isNotNull(categories.deletedAt))
      .orderBy(desc(categories.deletedAt))
      .limit(CATALOG_TRASH_LIST_LIMIT),
    db
      .select({
        id: pages.id,
        title: pageTranslations.title,
        slug: pageTranslations.slug,
        deletedAt: pages.deletedAt,
      })
      .from(pages)
      .leftJoin(
        pageTranslations,
        and(eq(pageTranslations.pageId, pages.id), eq(pageTranslations.language, "uk")),
      )
      .where(isNotNull(pages.deletedAt))
      .orderBy(desc(pages.deletedAt))
      .limit(CATALOG_TRASH_LIST_LIMIT),
    db
      .select({
        id: brands.id,
        name: brandTranslations.name,
        slug: brands.slug,
        deletedAt: brands.deletedAt,
      })
      .from(brands)
      .leftJoin(
        brandTranslations,
        and(eq(brandTranslations.brandId, brands.id), eq(brandTranslations.language, "uk")),
      )
      .where(isNotNull(brands.deletedAt))
      .orderBy(desc(brands.deletedAt))
      .limit(CATALOG_TRASH_LIST_LIMIT),
  ]);

  const items: CatalogTrashListItem[] = [
    ...productRows
      .filter((row): row is typeof row & { deletedAt: Date } => row.deletedAt !== null)
      .map((row) => ({
        id: row.id,
        entityType: "product" as const,
        label: row.name ?? row.sku,
        secondaryLabel: row.sku,
        deletedAt: row.deletedAt,
      })),
    ...categoryRows
      .filter((row): row is typeof row & { deletedAt: Date } => row.deletedAt !== null)
      .map((row) => ({
        id: row.id,
        entityType: "category" as const,
        label: row.name ?? "Untitled category",
        secondaryLabel: row.slug,
        deletedAt: row.deletedAt,
      })),
    ...pageRows
      .filter((row): row is typeof row & { deletedAt: Date } => row.deletedAt !== null)
      .map((row) => ({
        id: row.id,
        entityType: "page" as const,
        label: row.title ?? "Untitled page",
        secondaryLabel: row.slug,
        deletedAt: row.deletedAt,
      })),
    ...brandRows
      .filter((row): row is typeof row & { deletedAt: Date } => row.deletedAt !== null)
      .map((row) => ({
        id: row.id,
        entityType: "brand" as const,
        label: row.name ?? "Untitled brand",
        secondaryLabel: row.slug,
        deletedAt: row.deletedAt,
      })),
  ];

  return items
    .sort((left, right) => right.deletedAt.getTime() - left.deletedAt.getTime())
    .slice(0, CATALOG_TRASH_LIST_LIMIT);
}
