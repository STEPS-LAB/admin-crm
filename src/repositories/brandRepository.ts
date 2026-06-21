import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  ne,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { getDb } from "@/db/client";
import { brandTranslations, brands, products } from "@/db/schema/catalog";
import { seoAnalysis, seoProfiles } from "@/db/schema/seo";
import { calculatePagination, restoreById, softDeleteById, softDeleteFilter, withTransaction } from "@/repositories/baseRepository";

import type { Pagination, PaginationParams } from "@/types";
import type {
  BrandDetail,
  BrandFormInput,
  BrandListFilters,
  BrandListItem,
  BrandTranslationInput,
} from "@/types/brands";

async function getProductCount(brandId: string): Promise<number> {
  const db = getDb();
  const result = await db
    .select({ value: count() })
    .from(products)
    .where(and(eq(products.brandId, brandId), softDeleteFilter(products.deletedAt)));

  return result[0]?.value ?? 0;
}

function buildListWhere(filters: BrandListFilters): SQL | undefined {
  const conditions: SQL[] = [softDeleteFilter(brands.deletedAt)];

  if (filters.status) {
    conditions.push(eq(brands.status, filters.status));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(brandTranslations.name, term),
        ilike(brands.slug, term),
        ilike(brands.country, term),
        ilike(brands.website, term),
      )!,
    );
  }

  if (filters.hasProducts === true) {
    conditions.push(
      sql`exists (
        select 1 from ${products}
        where ${products.brandId} = ${brands.id}
        and ${products.deletedAt} is null
      )`,
    );
  }

  if (filters.hasProducts === false) {
    conditions.push(
      sql`not exists (
        select 1 from ${products}
        where ${products.brandId} = ${brands.id}
        and ${products.deletedAt} is null
      )`,
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function listQueryBase() {
  const db = getDb();

  return db
    .select({
      id: brands.id,
      slug: brands.slug,
      status: brands.status,
      country: brands.country,
      website: brands.website,
      logoUrl: brands.logoUrl,
      updatedAt: brands.updatedAt,
      name: brandTranslations.name,
      productCount: sql<number>`(
        select count(*)::int from ${products}
        where ${products.brandId} = ${brands.id}
        and ${products.deletedAt} is null
      )`,
      seoScore: seoAnalysis.overallScore,
    })
    .from(brands)
    .leftJoin(
      brandTranslations,
      and(eq(brandTranslations.brandId, brands.id), eq(brandTranslations.language, "uk")),
    )
    .leftJoin(
      seoProfiles,
      and(
        eq(seoProfiles.ownerId, brands.id),
        eq(seoProfiles.ownerType, "brand"),
        eq(seoProfiles.language, "uk"),
        isNull(seoProfiles.deletedAt),
      ),
    )
    .leftJoin(seoAnalysis, eq(seoAnalysis.seoProfileId, seoProfiles.id));
}

export async function findBrands(filters: BrandListFilters): Promise<Pagination<BrandListItem>> {
  const whereClause = buildListWhere(filters);
  const offset = (filters.page - 1) * filters.pageSize;

  const [rows, totalResult] = await Promise.all([
    listQueryBase()
      .where(whereClause)
      .orderBy(desc(brands.updatedAt))
      .limit(filters.pageSize)
      .offset(offset),
    getDb()
      .select({ value: count() })
      .from(brands)
      .leftJoin(
        brandTranslations,
        and(eq(brandTranslations.brandId, brands.id), eq(brandTranslations.language, "uk")),
      )
      .where(whereClause),
  ]);

  const items: BrandListItem[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    status: row.status,
    country: row.country,
    website: row.website,
    logoUrl: row.logoUrl,
    name: row.name ?? "Untitled brand",
    productCount: row.productCount,
    seoScore: row.seoScore,
    updatedAt: row.updatedAt,
  }));

  const paginationParams: PaginationParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  };

  return calculatePagination(items, totalResult[0]?.value ?? 0, paginationParams);
}

export async function findBrandById(id: string): Promise<BrandDetail | null> {
  const db = getDb();

  const [brand] = await db
    .select()
    .from(brands)
    .where(and(eq(brands.id, id), softDeleteFilter(brands.deletedAt)))
    .limit(1);

  if (!brand) {
    return null;
  }

  const translations = await db
    .select()
    .from(brandTranslations)
    .where(eq(brandTranslations.brandId, id));

  const uk = translations.find((row) => row.language === "uk");
  const en = translations.find((row) => row.language === "en");

  if (!uk || !en) {
    return null;
  }

  const mapTranslation = (row: typeof uk): BrandTranslationInput => ({
    name: row.name,
    description: row.description,
  });

  const productCount = await getProductCount(id);

  return {
    id: brand.id,
    slug: brand.slug,
    logoUrl: brand.logoUrl,
    website: brand.website,
    country: brand.country,
    status: brand.status,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
    translations: {
      uk: mapTranslation(uk),
      en: mapTranslation(en),
    },
    productCount,
  };
}

export async function slugExists(slug: string, excludeBrandId?: string): Promise<boolean> {
  const db = getDb();
  const conditions: SQL[] = [eq(brands.slug, slug), softDeleteFilter(brands.deletedAt)];

  if (excludeBrandId) {
    conditions.push(ne(brands.id, excludeBrandId));
  }

  const result = await db
    .select({ value: count() })
    .from(brands)
    .where(and(...conditions));

  return (result[0]?.value ?? 0) > 0;
}

export async function insertBrand(input: BrandFormInput): Promise<string> {
  return withTransaction(async (tx) => {
    const [created] = await tx
      .insert(brands)
      .values({
        slug: input.slug,
        logoUrl: input.logoUrl,
        website: input.website,
        country: input.country,
        status: input.status,
      })
      .returning({ id: brands.id });

    if (!created) {
      throw new Error("Failed to create brand");
    }

    await tx.insert(brandTranslations).values([
      {
        brandId: created.id,
        language: "uk",
        name: input.translations.uk.name,
        description: input.translations.uk.description,
      },
      {
        brandId: created.id,
        language: "en",
        name: input.translations.en.name,
        description: input.translations.en.description,
      },
    ]);

    return created.id;
  });
}

export async function updateBrandRecord(id: string, input: BrandFormInput): Promise<void> {
  await withTransaction(async (tx) => {
    await tx
      .update(brands)
      .set({
        slug: input.slug,
        logoUrl: input.logoUrl,
        website: input.website,
        country: input.country,
        status: input.status,
        updatedAt: new Date(),
      })
      .where(and(eq(brands.id, id), softDeleteFilter(brands.deletedAt)));

    for (const language of ["uk", "en"] as const) {
      const translation = input.translations[language];

      await tx
        .update(brandTranslations)
        .set({
          name: translation.name,
          description: translation.description,
          updatedAt: new Date(),
        })
        .where(and(eq(brandTranslations.brandId, id), eq(brandTranslations.language, language)));
    }
  });
}

export async function updateBrandStatus(id: string, status: BrandFormInput["status"]): Promise<void> {
  const db = getDb();

  await db
    .update(brands)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(and(eq(brands.id, id), softDeleteFilter(brands.deletedAt)));
}

export async function softDeleteBrand(id: string): Promise<boolean> {
  return softDeleteById(brands, brands.id, brands.deletedAt, id);
}

export async function restoreBrandById(id: string): Promise<boolean> {
  return restoreById(brands, brands.id, brands.deletedAt, id);
}

export async function findDeletedBrandById(id: string): Promise<BrandDetail | null> {
  const db = getDb();

  const [brand] = await db
    .select()
    .from(brands)
    .where(and(eq(brands.id, id), isNotNull(brands.deletedAt)))
    .limit(1);

  if (!brand) {
    return null;
  }

  const translations = await db
    .select()
    .from(brandTranslations)
    .where(eq(brandTranslations.brandId, id));

  const uk = translations.find((row) => row.language === "uk");
  const en = translations.find((row) => row.language === "en");

  if (!uk || !en) {
    return null;
  }

  const mapTranslation = (row: typeof uk): BrandTranslationInput => ({
    name: row.name,
    description: row.description,
  });

  const productCount = await getProductCount(id);

  return {
    id: brand.id,
    slug: brand.slug,
    logoUrl: brand.logoUrl,
    website: brand.website,
    country: brand.country,
    status: brand.status,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
    translations: {
      uk: mapTranslation(uk),
      en: mapTranslation(en),
    },
    productCount,
  };
}
