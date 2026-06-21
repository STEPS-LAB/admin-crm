import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  brandTranslations,
  brands,
  categoryTranslations,
  categories,
  productTranslations,
  products,
} from "@/db/schema/catalog";
import { pageTranslations, pages } from "@/db/schema/pages";
import { internalLinks, metadata, seoProfiles } from "@/db/schema/seo";
import { softDeleteFilter } from "@/repositories/baseRepository";

import type { SeoOwnerType } from "@/constants/seo";
import type { InternalLinkFormInput } from "@/types/seo-templates";

export interface InternalLinkRecord {
  readonly id: string;
  readonly seoProfileId: string;
  readonly targetOwnerType: SeoOwnerType;
  readonly targetOwnerId: string;
  readonly anchorText: string | null;
  readonly sortOrder: number;
  readonly isAutomatic: boolean;
  readonly updatedAt: Date;
}

export interface InternalLinkSourceRecord {
  readonly id: string;
  readonly seoProfileId: string;
  readonly targetOwnerType: SeoOwnerType;
  readonly targetOwnerId: string;
  readonly anchorText: string | null;
  readonly sortOrder: number;
  readonly isAutomatic: boolean;
  readonly updatedAt: Date;
  readonly sourceOwnerType: SeoOwnerType;
  readonly sourceOwnerId: string;
  readonly sourceLanguage: "uk" | "en";
  readonly sourceProductName: string | null;
  readonly sourceCategoryName: string | null;
  readonly sourcePageTitle: string | null;
  readonly sourceBrandName: string | null;
  readonly metaTitle: string | null;
}

const TARGET_SEARCH_LIMIT = 20;

export async function findInternalLinksByProfileId(
  seoProfileId: string,
): Promise<InternalLinkRecord[]> {
  const db = getDb();

  return db
    .select({
      id: internalLinks.id,
      seoProfileId: internalLinks.seoProfileId,
      targetOwnerType: internalLinks.targetOwnerType,
      targetOwnerId: internalLinks.targetOwnerId,
      anchorText: internalLinks.anchorText,
      sortOrder: internalLinks.sortOrder,
      isAutomatic: internalLinks.isAutomatic,
      updatedAt: internalLinks.updatedAt,
    })
    .from(internalLinks)
    .where(eq(internalLinks.seoProfileId, seoProfileId))
    .orderBy(internalLinks.sortOrder, desc(internalLinks.updatedAt));
}

export async function findAllManualInternalLinkSources(): Promise<InternalLinkSourceRecord[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: internalLinks.id,
      seoProfileId: internalLinks.seoProfileId,
      targetOwnerType: internalLinks.targetOwnerType,
      targetOwnerId: internalLinks.targetOwnerId,
      anchorText: internalLinks.anchorText,
      sortOrder: internalLinks.sortOrder,
      isAutomatic: internalLinks.isAutomatic,
      updatedAt: internalLinks.updatedAt,
      sourceOwnerType: seoProfiles.ownerType,
      sourceOwnerId: seoProfiles.ownerId,
      sourceLanguage: seoProfiles.language,
      sourceProductName: productTranslations.name,
      sourceCategoryName: categoryTranslations.name,
      sourcePageTitle: pageTranslations.title,
      sourceBrandName: brandTranslations.name,
      metaTitle: metadata.metaTitle,
    })
    .from(internalLinks)
    .innerJoin(seoProfiles, eq(internalLinks.seoProfileId, seoProfiles.id))
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
      and(eq(pageTranslations.pageId, pages.id), eq(pageTranslations.language, seoProfiles.language)),
    )
    .leftJoin(
      brands,
      and(eq(seoProfiles.ownerType, "brand"), eq(seoProfiles.ownerId, brands.id)),
    )
    .leftJoin(
      brandTranslations,
      and(eq(brandTranslations.brandId, brands.id), eq(brandTranslations.language, seoProfiles.language)),
    )
    .where(and(eq(internalLinks.isAutomatic, false), isNull(seoProfiles.deletedAt)))
    .orderBy(desc(internalLinks.updatedAt))
    .limit(200);

  return rows;
}

export async function insertInternalLink(input: InternalLinkFormInput): Promise<string> {
  const db = getDb();

  const [sortResult] = await db
    .select({ value: count() })
    .from(internalLinks)
    .where(eq(internalLinks.seoProfileId, input.seoProfileId));

  const [created] = await db
    .insert(internalLinks)
    .values({
      seoProfileId: input.seoProfileId,
      targetOwnerType: input.targetOwnerType,
      targetOwnerId: input.targetOwnerId,
      anchorText: input.anchorText,
      sortOrder: sortResult?.value ?? 0,
      isAutomatic: false,
    })
    .returning({ id: internalLinks.id });

  if (!created) {
    throw new Error("Failed to create internal link");
  }

  return created.id;
}

export async function deleteInternalLinkById(id: string): Promise<boolean> {
  const db = getDb();
  const result = await db.delete(internalLinks).where(eq(internalLinks.id, id));

  return (result.count ?? 0) > 0;
}

export async function findEntityLabel(
  ownerType: SeoOwnerType,
  ownerId: string,
  language: "uk" | "en",
): Promise<string | null> {
  const db = getDb();

  switch (ownerType) {
    case "product": {
      const [row] = await db
        .select({ label: productTranslations.name })
        .from(productTranslations)
        .where(and(eq(productTranslations.productId, ownerId), eq(productTranslations.language, language)))
        .limit(1);
      return row?.label ?? null;
    }
    case "category": {
      const [row] = await db
        .select({ label: categoryTranslations.name })
        .from(categoryTranslations)
        .where(
          and(eq(categoryTranslations.categoryId, ownerId), eq(categoryTranslations.language, language)),
        )
        .limit(1);
      return row?.label ?? null;
    }
    case "page": {
      const [row] = await db
        .select({ label: pageTranslations.title })
        .from(pageTranslations)
        .where(and(eq(pageTranslations.pageId, ownerId), eq(pageTranslations.language, language)))
        .limit(1);
      return row?.label ?? null;
    }
    case "brand": {
      const [row] = await db
        .select({ label: brandTranslations.name })
        .from(brandTranslations)
        .where(and(eq(brandTranslations.brandId, ownerId), eq(brandTranslations.language, language)))
        .limit(1);
      return row?.label ?? null;
    }
    default:
      return null;
  }
}

export async function findInternalLinkTargets(
  search: string,
): Promise<
  Array<{
    readonly ownerType: SeoOwnerType;
    readonly ownerId: string;
    readonly label: string;
    readonly secondaryLabel: string | null;
  }>
> {
  const db = getDb();
  const term = `%${search}%`;

  const [productRows, categoryRows, pageRows, brandRows] = await Promise.all([
    db
      .select({
        id: products.id,
        name: productTranslations.name,
        slug: productTranslations.slug,
      })
      .from(products)
      .innerJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.language, "uk")),
      )
      .where(
        and(
          softDeleteFilter(products.deletedAt),
          or(ilike(productTranslations.name, term), ilike(productTranslations.slug, term))!,
        ),
      )
      .limit(TARGET_SEARCH_LIMIT),
    db
      .select({
        id: categories.id,
        name: categoryTranslations.name,
        slug: categoryTranslations.slug,
      })
      .from(categories)
      .innerJoin(
        categoryTranslations,
        and(eq(categoryTranslations.categoryId, categories.id), eq(categoryTranslations.language, "uk")),
      )
      .where(
        and(
          softDeleteFilter(categories.deletedAt),
          or(ilike(categoryTranslations.name, term), ilike(categoryTranslations.slug, term))!,
        ),
      )
      .limit(TARGET_SEARCH_LIMIT),
    db
      .select({
        id: pages.id,
        title: pageTranslations.title,
        slug: pageTranslations.slug,
      })
      .from(pages)
      .innerJoin(
        pageTranslations,
        and(eq(pageTranslations.pageId, pages.id), eq(pageTranslations.language, "uk")),
      )
      .where(
        and(
          softDeleteFilter(pages.deletedAt),
          or(ilike(pageTranslations.title, term), ilike(pageTranslations.slug, term))!,
        ),
      )
      .limit(TARGET_SEARCH_LIMIT),
    db
      .select({
        id: brands.id,
        name: brandTranslations.name,
        slug: brands.slug,
      })
      .from(brands)
      .innerJoin(
        brandTranslations,
        and(eq(brandTranslations.brandId, brands.id), eq(brandTranslations.language, "uk")),
      )
      .where(
        and(
          softDeleteFilter(brands.deletedAt),
          or(ilike(brandTranslations.name, term), ilike(brands.slug, term))!,
        ),
      )
      .limit(TARGET_SEARCH_LIMIT),
  ]);

  return [
    ...productRows.map((row) => ({
      ownerType: "product" as const,
      ownerId: row.id,
      label: row.name,
      secondaryLabel: row.slug,
    })),
    ...categoryRows.map((row) => ({
      ownerType: "category" as const,
      ownerId: row.id,
      label: row.name,
      secondaryLabel: row.slug,
    })),
    ...pageRows.map((row) => ({
      ownerType: "page" as const,
      ownerId: row.id,
      label: row.title,
      secondaryLabel: row.slug,
    })),
    ...brandRows.map((row) => ({
      ownerType: "brand" as const,
      ownerId: row.id,
      label: row.name,
      secondaryLabel: row.slug,
    })),
  ].slice(0, TARGET_SEARCH_LIMIT);
}
