import { and, count, desc, eq, ilike, isNotNull, isNull, ne, or, type SQL } from "drizzle-orm";

import { getDb } from "@/db/client";
import { pageTranslations, pages } from "@/db/schema/pages";
import { seoAnalysis, seoProfiles } from "@/db/schema/seo";
import { calculatePagination, restoreById, softDeleteById, softDeleteFilter, withTransaction } from "@/repositories/baseRepository";

import type { Pagination, PaginationParams } from "@/types";
import type {
  PageDetail,
  PageFormInput,
  PageListFilters,
  PageListItem,
  PageTranslationInput,
} from "@/types/pages";

function buildListWhere(filters: PageListFilters): SQL | undefined {
  const conditions: SQL[] = [softDeleteFilter(pages.deletedAt)];

  if (filters.status) {
    conditions.push(eq(pages.status, filters.status));
  }

  if (filters.pageType) {
    conditions.push(eq(pages.pageType, filters.pageType));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(pageTranslations.title, term),
        ilike(pageTranslations.slug, term),
        ilike(pageTranslations.excerpt, term),
      )!,
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function listQueryBase() {
  const db = getDb();

  return db
    .select({
      id: pages.id,
      pageType: pages.pageType,
      status: pages.status,
      isHomepage: pages.isHomepage,
      sortOrder: pages.sortOrder,
      updatedAt: pages.updatedAt,
      title: pageTranslations.title,
      slug: pageTranslations.slug,
      seoScore: seoAnalysis.overallScore,
    })
    .from(pages)
    .leftJoin(
      pageTranslations,
      and(eq(pageTranslations.pageId, pages.id), eq(pageTranslations.language, "uk")),
    )
    .leftJoin(
      seoProfiles,
      and(
        eq(seoProfiles.ownerId, pages.id),
        eq(seoProfiles.ownerType, "page"),
        eq(seoProfiles.language, "uk"),
        isNull(seoProfiles.deletedAt),
      ),
    )
    .leftJoin(seoAnalysis, eq(seoAnalysis.seoProfileId, seoProfiles.id));
}

export async function findPages(filters: PageListFilters): Promise<Pagination<PageListItem>> {
  const whereClause = buildListWhere(filters);
  const offset = (filters.page - 1) * filters.pageSize;

  const [rows, totalResult] = await Promise.all([
    listQueryBase()
      .where(whereClause)
      .orderBy(desc(pages.isHomepage), pages.sortOrder, desc(pages.updatedAt))
      .limit(filters.pageSize)
      .offset(offset),
    getDb()
      .select({ value: count() })
      .from(pages)
      .leftJoin(
        pageTranslations,
        and(eq(pageTranslations.pageId, pages.id), eq(pageTranslations.language, "uk")),
      )
      .where(whereClause),
  ]);

  const items: PageListItem[] = rows.map((row) => ({
    id: row.id,
    pageType: row.pageType,
    status: row.status,
    isHomepage: row.isHomepage,
    sortOrder: row.sortOrder,
    updatedAt: row.updatedAt,
    title: row.title ?? "Untitled page",
    slug: row.slug ?? "",
    seoScore: row.seoScore,
  }));

  const paginationParams: PaginationParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  };

  return calculatePagination(items, totalResult[0]?.value ?? 0, paginationParams);
}

export async function findPageById(id: string): Promise<PageDetail | null> {
  const db = getDb();

  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, id), softDeleteFilter(pages.deletedAt)))
    .limit(1);

  if (!page) {
    return null;
  }

  const translations = await db
    .select()
    .from(pageTranslations)
    .where(eq(pageTranslations.pageId, id));

  const uk = translations.find((row) => row.language === "uk");
  const en = translations.find((row) => row.language === "en");

  if (!uk || !en) {
    return null;
  }

  const mapTranslation = (row: typeof uk): PageTranslationInput => ({
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
  });

  return {
    id: page.id,
    pageType: page.pageType,
    status: page.status,
    isHomepage: page.isHomepage,
    sortOrder: page.sortOrder,
    publishedAt: page.publishedAt,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    translations: {
      uk: mapTranslation(uk),
      en: mapTranslation(en),
    },
  };
}

export async function slugExists(
  language: "uk" | "en",
  slug: string,
  excludePageId?: string,
): Promise<boolean> {
  const db = getDb();
  const conditions: SQL[] = [
    eq(pageTranslations.language, language),
    eq(pageTranslations.slug, slug),
    softDeleteFilter(pages.deletedAt),
  ];

  if (excludePageId) {
    conditions.push(ne(pages.id, excludePageId));
  }

  const result = await db
    .select({ value: count() })
    .from(pageTranslations)
    .innerJoin(pages, eq(pageTranslations.pageId, pages.id))
    .where(and(...conditions));

  return (result[0]?.value ?? 0) > 0;
}

export async function homepageExists(excludePageId?: string): Promise<boolean> {
  const db = getDb();
  const conditions: SQL[] = [eq(pages.isHomepage, true), softDeleteFilter(pages.deletedAt)];

  if (excludePageId) {
    conditions.push(ne(pages.id, excludePageId));
  }

  const result = await db
    .select({ value: count() })
    .from(pages)
    .where(and(...conditions));

  return (result[0]?.value ?? 0) > 0;
}

async function clearOtherHomepages(tx: ReturnType<typeof getDb>, excludePageId?: string): Promise<void> {
  const conditions: SQL[] = [eq(pages.isHomepage, true), softDeleteFilter(pages.deletedAt)];

  if (excludePageId) {
    conditions.push(ne(pages.id, excludePageId));
  }

  await tx
    .update(pages)
    .set({ isHomepage: false, updatedAt: new Date() })
    .where(and(...conditions));
}

export async function insertPage(input: PageFormInput): Promise<string> {
  return withTransaction(async (tx) => {
    if (input.isHomepage) {
      await clearOtherHomepages(tx as unknown as ReturnType<typeof getDb>);
    }

    const [created] = await tx
      .insert(pages)
      .values({
        pageType: input.pageType,
        status: input.status,
        isHomepage: input.isHomepage,
        sortOrder: input.sortOrder,
        publishedAt: input.status === "published" ? new Date() : null,
      })
      .returning({ id: pages.id });

    if (!created) {
      throw new Error("Failed to create page");
    }

    await tx.insert(pageTranslations).values([
      {
        pageId: created.id,
        language: "uk",
        title: input.translations.uk.title,
        slug: input.translations.uk.slug,
        content: input.translations.uk.content,
        excerpt: input.translations.uk.excerpt,
      },
      {
        pageId: created.id,
        language: "en",
        title: input.translations.en.title,
        slug: input.translations.en.slug,
        content: input.translations.en.content,
        excerpt: input.translations.en.excerpt,
      },
    ]);

    return created.id;
  });
}

export async function updatePageRecord(id: string, input: PageFormInput): Promise<void> {
  await withTransaction(async (tx) => {
    if (input.isHomepage) {
      await clearOtherHomepages(tx as unknown as ReturnType<typeof getDb>, id);
    }

    await tx
      .update(pages)
      .set({
        pageType: input.pageType,
        status: input.status,
        isHomepage: input.isHomepage,
        sortOrder: input.sortOrder,
        publishedAt: input.status === "published" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(and(eq(pages.id, id), softDeleteFilter(pages.deletedAt)));

    for (const language of ["uk", "en"] as const) {
      const translation = input.translations[language];

      await tx
        .update(pageTranslations)
        .set({
          title: translation.title,
          slug: translation.slug,
          content: translation.content,
          excerpt: translation.excerpt,
          updatedAt: new Date(),
        })
        .where(and(eq(pageTranslations.pageId, id), eq(pageTranslations.language, language)));
    }
  });
}

export async function updatePageStatus(id: string, status: PageFormInput["status"]): Promise<void> {
  const db = getDb();

  await db
    .update(pages)
    .set({
      status,
      publishedAt: status === "published" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(pages.id, id), softDeleteFilter(pages.deletedAt)));
}

export async function softDeletePage(id: string): Promise<boolean> {
  return softDeleteById(pages, pages.id, pages.deletedAt, id);
}

export async function restorePageById(id: string): Promise<boolean> {
  return restoreById(pages, pages.id, pages.deletedAt, id);
}

export async function findDeletedPageById(id: string): Promise<PageDetail | null> {
  const db = getDb();

  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, id), isNotNull(pages.deletedAt)))
    .limit(1);

  if (!page) {
    return null;
  }

  const translations = await db
    .select()
    .from(pageTranslations)
    .where(eq(pageTranslations.pageId, id));

  const uk = translations.find((row) => row.language === "uk");
  const en = translations.find((row) => row.language === "en");

  if (!uk || !en) {
    return null;
  }

  const mapTranslation = (row: typeof uk): PageTranslationInput => ({
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
  });

  return {
    id: page.id,
    pageType: page.pageType,
    status: page.status,
    isHomepage: page.isHomepage,
    sortOrder: page.sortOrder,
    publishedAt: page.publishedAt,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    translations: {
      uk: mapTranslation(uk),
      en: mapTranslation(en),
    },
  };
}
