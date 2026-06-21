import { and, count, desc, eq, ilike, isNull, or, type SQL } from "drizzle-orm";

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
import { metadata, openGraph, robots, seoAnalysis, seoProfiles, canonical } from "@/db/schema/seo";
import { calculatePagination, withTransaction } from "@/repositories/baseRepository";

import type { Pagination, PaginationParams } from "@/types";
import type {
  SeoMetadataInput,
  SeoProfileDetail,
  SeoProfileListFilters,
  SeoProfileListItem,
} from "@/types/seo-center";
import type { SeoTemplateAppliedMetadata } from "@/types/seo-templates";
import type { SeoOwnerType } from "@/constants/seo";

function buildProfileWhere(filters: SeoProfileListFilters): SQL | undefined {
  const conditions: SQL[] = [isNull(seoProfiles.deletedAt)];

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

  return and(...conditions);
}

export async function findSeoProfiles(
  filters: SeoProfileListFilters,
): Promise<Pagination<SeoProfileListItem>> {
  const db = getDb();
  const whereClause = buildProfileWhere(filters);
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
    .where(whereClause);

  const items: SeoProfileListItem[] = rows.map((row) => ({
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
    overallScore: row.overallScore,
    isIndexable: row.isIndexable,
    updatedAt: row.updatedAt,
    entityHref: null,
  }));

  const paginationParams: PaginationParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  };

  return calculatePagination(items, totalResult[0]?.value ?? 0, paginationParams);
}

export async function findSeoProfileById(id: string): Promise<SeoProfileDetail | null> {
  const db = getDb();

  const [row] = await db
    .select({
      id: seoProfiles.id,
      ownerType: seoProfiles.ownerType,
      ownerId: seoProfiles.ownerId,
      language: seoProfiles.language,
      isIndexable: seoProfiles.isIndexable,
      updatedAt: seoProfiles.updatedAt,
      metaTitle: metadata.metaTitle,
      metaDescription: metadata.metaDescription,
      index: robots.index,
      follow: robots.follow,
      overallScore: seoAnalysis.overallScore,
      metadataScore: seoAnalysis.metadataScore,
      schemaScore: seoAnalysis.schemaScore,
      productName: productTranslations.name,
      categoryName: categoryTranslations.name,
      pageTitle: pageTranslations.title,
      brandName: brandTranslations.name,
    })
    .from(seoProfiles)
    .leftJoin(metadata, eq(metadata.seoProfileId, seoProfiles.id))
    .leftJoin(robots, eq(robots.seoProfileId, seoProfiles.id))
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
    .where(and(eq(seoProfiles.id, id), isNull(seoProfiles.deletedAt)))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    ownerType: row.ownerType as SeoOwnerType,
    ownerId: row.ownerId,
    language: row.language,
    entityLabel:
      row.productName ??
      row.categoryName ??
      row.pageTitle ??
      row.brandName ??
      row.ownerId,
    isIndexable: row.isIndexable,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    index: row.index ?? true,
    follow: row.follow ?? true,
    overallScore: row.overallScore,
    metadataScore: row.metadataScore,
    schemaScore: row.schemaScore,
    updatedAt: row.updatedAt,
    entityHref: null,
  };
}

export async function updateSeoProfileMetadata(
  profileId: string,
  input: SeoMetadataInput,
): Promise<void> {
  const db = getDb();

  await db
    .update(metadata)
    .set({
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      updatedAt: new Date(),
    })
    .where(eq(metadata.seoProfileId, profileId));

  await db
    .update(robots)
    .set({
      index: input.index,
      follow: input.follow,
      updatedAt: new Date(),
    })
    .where(eq(robots.seoProfileId, profileId));

  await db
    .update(seoProfiles)
    .set({
      isIndexable: input.index,
      updatedAt: new Date(),
    })
    .where(eq(seoProfiles.id, profileId));
}

export async function applyTemplateMetadataToProfile(
  profileId: string,
  values: SeoTemplateAppliedMetadata,
): Promise<void> {
  const db = getDb();

  await db
    .update(metadata)
    .set({
      metaTitle: values.metaTitle,
      metaDescription: values.metaDescription,
      updatedAt: new Date(),
    })
    .where(eq(metadata.seoProfileId, profileId));

  const [existingOg] = await db
    .select({ id: openGraph.id })
    .from(openGraph)
    .where(eq(openGraph.seoProfileId, profileId))
    .limit(1);

  if (existingOg) {
    await db
      .update(openGraph)
      .set({
        ogTitle: values.ogTitle,
        ogDescription: values.ogDescription,
        updatedAt: new Date(),
      })
      .where(eq(openGraph.seoProfileId, profileId));
  } else {
    await db.insert(openGraph).values({
      seoProfileId: profileId,
      ogTitle: values.ogTitle,
      ogDescription: values.ogDescription,
    });
  }

  await db
    .update(seoProfiles)
    .set({ updatedAt: new Date() })
    .where(eq(seoProfiles.id, profileId));
}

export async function findSeoProfilesByOwner(
  ownerType: SeoOwnerType,
  ownerId: string,
): Promise<SeoProfileDetail[]> {
  const db = getDb();

  const rows = await db
    .select({ id: seoProfiles.id })
    .from(seoProfiles)
    .where(
      and(
        eq(seoProfiles.ownerType, ownerType),
        eq(seoProfiles.ownerId, ownerId),
        isNull(seoProfiles.deletedAt),
      ),
    );

  const profiles = await Promise.all(rows.map((row) => findSeoProfileById(row.id)));

  return profiles.filter((profile): profile is SeoProfileDetail => profile !== null);
}

export interface OwnerSeoProfileLabels {
  readonly uk: string;
  readonly en: string;
}

export async function ensureOwnerSeoProfiles(
  ownerType: SeoOwnerType,
  ownerId: string,
  labels: OwnerSeoProfileLabels,
): Promise<void> {
  const db = getDb();

  const existing = await db
    .select({ language: seoProfiles.language })
    .from(seoProfiles)
    .where(
      and(
        eq(seoProfiles.ownerType, ownerType),
        eq(seoProfiles.ownerId, ownerId),
        isNull(seoProfiles.deletedAt),
      ),
    );

  const existingLanguages = new Set(existing.map((row) => row.language));

  for (const language of ["uk", "en"] as const) {
    if (existingLanguages.has(language)) {
      continue;
    }

    await withTransaction(async (tx) => {
      const [profile] = await tx
        .insert(seoProfiles)
        .values({
          ownerType,
          ownerId,
          language,
          isIndexable: true,
        })
        .returning({ id: seoProfiles.id });

      if (!profile) {
        throw new Error("Failed to create SEO profile");
      }

      const label = labels[language];

      await tx.insert(metadata).values({
        seoProfileId: profile.id,
        metaTitle: label,
      });

      await tx.insert(canonical).values({
        seoProfileId: profile.id,
        autoGenerate: true,
      });

      await tx.insert(robots).values({
        seoProfileId: profile.id,
      });
    });
  }
}

export async function ownerSeoProfilesAreComplete(
  ownerType: SeoOwnerType,
  ownerId: string,
): Promise<boolean> {
  const db = getDb();

  const rows = await db
    .select({ language: seoProfiles.language })
    .from(seoProfiles)
    .where(
      and(
        eq(seoProfiles.ownerType, ownerType),
        eq(seoProfiles.ownerId, ownerId),
        isNull(seoProfiles.deletedAt),
      ),
    );

  const languages = new Set(rows.map((row) => row.language));

  return languages.has("uk") && languages.has("en");
}

export async function findOwnerAverageSeoScore(
  ownerType: SeoOwnerType,
  ownerId: string,
): Promise<number | null> {
  const db = getDb();

  const rows = await db
    .select({ overallScore: seoAnalysis.overallScore })
    .from(seoProfiles)
    .leftJoin(seoAnalysis, eq(seoAnalysis.seoProfileId, seoProfiles.id))
    .where(
      and(
        eq(seoProfiles.ownerType, ownerType),
        eq(seoProfiles.ownerId, ownerId),
        isNull(seoProfiles.deletedAt),
      ),
    );

  const scores = rows
    .map((row) => row.overallScore)
    .filter((score): score is number => score !== null);

  if (scores.length === 0) {
    return null;
  }

  const total = scores.reduce((sum, score) => sum + score, 0);

  return Math.round(total / scores.length);
}
