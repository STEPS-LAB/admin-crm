import { and, count, eq, ilike, isNotNull, isNull, ne, or, sql, type SQL } from "drizzle-orm";

import { getDb } from "@/db/client";
import { categories, categoryTranslations, products } from "@/db/schema/catalog";
import { seoAnalysis, seoProfiles } from "@/db/schema/seo";
import { mediaAssets, mediaUsage } from "@/db/schema/storage";
import { buildMediaPublicUrl } from "@/lib/media/publicUrl";
import { restoreById, softDeleteById, softDeleteFilter, withTransaction } from "@/repositories/baseRepository";

import type {
  CategoryDetail,
  CategoryFlatItem,
  CategoryFormInput,
  CategoryListFilters,
  CategoryTranslationInput,
} from "@/types/categories";

async function getProductCount(categoryId: string): Promise<number> {
  const db = getDb();
  const result = await db
    .select({ value: count() })
    .from(products)
    .where(and(eq(products.categoryId, categoryId), softDeleteFilter(products.deletedAt)));

  return result[0]?.value ?? 0;
}

async function getChildrenCount(categoryId: string): Promise<number> {
  const db = getDb();
  const result = await db
    .select({ value: count() })
    .from(categories)
    .where(and(eq(categories.parentId, categoryId), softDeleteFilter(categories.deletedAt)));

  return result[0]?.value ?? 0;
}

function buildListWhere(filters: CategoryListFilters): SQL | undefined {
  const conditions: SQL[] = [softDeleteFilter(categories.deletedAt)];

  if (filters.status) {
    conditions.push(eq(categories.status, filters.status));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(categoryTranslations.name, term),
        ilike(categoryTranslations.slug, term),
        ilike(categoryTranslations.description, term),
      )!,
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function findCategoriesFlat(filters: CategoryListFilters = {}): Promise<CategoryFlatItem[]> {
  const db = getDb();
  const whereClause = buildListWhere(filters);

  const rows = await db
    .select({
      id: categories.id,
      parentId: categories.parentId,
      sortOrder: categories.sortOrder,
      status: categories.status,
      name: categoryTranslations.name,
      slug: categoryTranslations.slug,
      description: categoryTranslations.description,
      updatedAt: categories.updatedAt,
      productCount: sql<number>`(
        select count(*)::int from ${products}
        where ${products.categoryId} = ${categories.id}
        and ${products.deletedAt} is null
      )`,
      childrenCount: sql<number>`(
        select count(*)::int from ${categories} as child_categories
        where child_categories.parent_id = ${categories.id}
        and child_categories.deleted_at is null
      )`,
      seoScore: seoAnalysis.overallScore,
      coverStorageBucket: mediaAssets.storageBucket,
      coverStoragePath: mediaAssets.storagePath,
      coverAltUk: mediaAssets.altUk,
      coverAltEn: mediaAssets.altEn,
      coverAssetDeleted: mediaAssets.isDeleted,
    })
    .from(categories)
    .leftJoin(
      categoryTranslations,
      and(eq(categoryTranslations.categoryId, categories.id), eq(categoryTranslations.language, "uk")),
    )
    .leftJoin(
      seoProfiles,
      and(
        eq(seoProfiles.ownerId, categories.id),
        eq(seoProfiles.ownerType, "category"),
        eq(seoProfiles.language, "uk"),
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
    .where(whereClause)
    .orderBy(categories.sortOrder, categoryTranslations.name);

  return rows.map((row) => {
    const hasCover =
      row.coverStorageBucket &&
      row.coverStoragePath &&
      row.coverAssetDeleted === false;

    return {
      id: row.id,
      parentId: row.parentId,
      sortOrder: row.sortOrder,
      status: row.status,
      name: row.name ?? "Untitled category",
      slug: row.slug ?? "",
      description: row.description,
      productCount: row.productCount,
      childrenCount: row.childrenCount,
      seoScore: row.seoScore,
      coverThumbnailUrl:
        hasCover && row.coverStorageBucket && row.coverStoragePath
          ? buildMediaPublicUrl(row.coverStorageBucket, row.coverStoragePath)
          : null,
      coverAlt: row.coverAltUk ?? row.coverAltEn ?? row.name ?? null,
      updatedAt: row.updatedAt,
    };
  });
}

export async function findAllCategoryIds(): Promise<Array<{ id: string; parentId: string | null }>> {
  const db = getDb();

  return db
    .select({
      id: categories.id,
      parentId: categories.parentId,
    })
    .from(categories)
    .where(softDeleteFilter(categories.deletedAt));
}

export async function findCategoryById(id: string): Promise<CategoryDetail | null> {
  const db = getDb();

  const [category] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), softDeleteFilter(categories.deletedAt)))
    .limit(1);

  if (!category) {
    return null;
  }

  const translations = await db
    .select()
    .from(categoryTranslations)
    .where(eq(categoryTranslations.categoryId, id));

  const uk = translations.find((row) => row.language === "uk");
  const en = translations.find((row) => row.language === "en");

  if (!uk || !en) {
    return null;
  }

  let parentName: string | null = null;

  if (category.parentId) {
    const [parentTranslation] = await db
      .select({ name: categoryTranslations.name })
      .from(categoryTranslations)
      .where(
        and(eq(categoryTranslations.categoryId, category.parentId), eq(categoryTranslations.language, "uk")),
      )
      .limit(1);

    parentName = parentTranslation?.name ?? null;
  }

  const mapTranslation = (row: typeof uk): CategoryTranslationInput => ({
    name: row.name,
    slug: row.slug,
    description: row.description,
  });

  const [productCount, childrenCount] = await Promise.all([
    getProductCount(id),
    getChildrenCount(id),
  ]);

  return {
    id: category.id,
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    status: category.status,
    imageId: category.imageId,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    translations: {
      uk: mapTranslation(uk),
      en: mapTranslation(en),
    },
    parentName,
    productCount,
    childrenCount,
  };
}

export async function slugExists(
  language: "uk" | "en",
  slug: string,
  excludeCategoryId?: string,
): Promise<boolean> {
  const db = getDb();
  const conditions: SQL[] = [
    eq(categoryTranslations.language, language),
    eq(categoryTranslations.slug, slug),
    softDeleteFilter(categories.deletedAt),
  ];

  if (excludeCategoryId) {
    conditions.push(ne(categories.id, excludeCategoryId));
  }

  const result = await db
    .select({ value: count() })
    .from(categoryTranslations)
    .innerJoin(categories, eq(categoryTranslations.categoryId, categories.id))
    .where(and(...conditions));

  return (result[0]?.value ?? 0) > 0;
}

export async function insertCategory(input: CategoryFormInput): Promise<string> {
  return withTransaction(async (tx) => {
    const [created] = await tx
      .insert(categories)
      .values({
        parentId: input.parentId,
        sortOrder: input.sortOrder,
        status: input.status,
      })
      .returning({ id: categories.id });

    if (!created) {
      throw new Error("Failed to create category");
    }

    await tx.insert(categoryTranslations).values([
      {
        categoryId: created.id,
        language: "uk",
        name: input.translations.uk.name,
        slug: input.translations.uk.slug,
        description: input.translations.uk.description,
      },
      {
        categoryId: created.id,
        language: "en",
        name: input.translations.en.name,
        slug: input.translations.en.slug,
        description: input.translations.en.description,
      },
    ]);

    return created.id;
  });
}

export async function updateCategoryRecord(id: string, input: CategoryFormInput): Promise<void> {
  await withTransaction(async (tx) => {
    await tx
      .update(categories)
      .set({
        parentId: input.parentId,
        sortOrder: input.sortOrder,
        status: input.status,
        updatedAt: new Date(),
      })
      .where(and(eq(categories.id, id), softDeleteFilter(categories.deletedAt)));

    for (const language of ["uk", "en"] as const) {
      const translation = input.translations[language];

      await tx
        .update(categoryTranslations)
        .set({
          name: translation.name,
          slug: translation.slug,
          description: translation.description,
          updatedAt: new Date(),
        })
        .where(
          and(eq(categoryTranslations.categoryId, id), eq(categoryTranslations.language, language)),
        );
    }
  });
}

export async function updateCategoryStatus(
  id: string,
  status: CategoryFormInput["status"],
): Promise<void> {
  const db = getDb();

  await db
    .update(categories)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(and(eq(categories.id, id), softDeleteFilter(categories.deletedAt)));
}

export async function softDeleteCategory(id: string): Promise<boolean> {
  return softDeleteById(categories, categories.id, categories.deletedAt, id);
}

export async function restoreCategoryById(id: string): Promise<boolean> {
  return restoreById(categories, categories.id, categories.deletedAt, id);
}

export async function findDeletedCategoryById(id: string): Promise<CategoryDetail | null> {
  const db = getDb();

  const [category] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), isNotNull(categories.deletedAt)))
    .limit(1);

  if (!category) {
    return null;
  }

  const translations = await db
    .select()
    .from(categoryTranslations)
    .where(eq(categoryTranslations.categoryId, id));

  const uk = translations.find((row) => row.language === "uk");
  const en = translations.find((row) => row.language === "en");

  if (!uk || !en) {
    return null;
  }

  let parentName: string | null = null;

  if (category.parentId) {
    const [parentTranslation] = await db
      .select({ name: categoryTranslations.name })
      .from(categoryTranslations)
      .where(
        and(eq(categoryTranslations.categoryId, category.parentId), eq(categoryTranslations.language, "uk")),
      )
      .limit(1);

    parentName = parentTranslation?.name ?? null;
  }

  const mapTranslation = (row: typeof uk): CategoryTranslationInput => ({
    name: row.name,
    slug: row.slug,
    description: row.description,
  });

  const [productCount, childrenCount] = await Promise.all([
    getProductCount(id),
    getChildrenCount(id),
  ]);

  return {
    id: category.id,
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    status: category.status,
    imageId: category.imageId,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    translations: {
      uk: mapTranslation(uk),
      en: mapTranslation(en),
    },
    parentName,
    productCount,
    childrenCount,
  };
}

export async function updateCategorySortOrders(
  parentId: string | null,
  orderedIds: string[],
): Promise<void> {
  await withTransaction(async (tx) => {
    for (let index = 0; index < orderedIds.length; index += 1) {
      const id = orderedIds[index]!;
      const parentCondition =
        parentId === null ? isNull(categories.parentId) : eq(categories.parentId, parentId);

      await tx
        .update(categories)
        .set({
          sortOrder: index,
          updatedAt: new Date(),
        })
        .where(and(eq(categories.id, id), parentCondition, softDeleteFilter(categories.deletedAt)));
    }
  });
}
