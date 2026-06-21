import { and, desc, eq, type SQL } from "drizzle-orm";

import { getDb } from "@/db/client";
import { seoTemplates } from "@/db/schema/seo";
import { withTransaction } from "@/repositories/baseRepository";

import type {
  SeoTemplateDetail,
  SeoTemplateFormInput,
  SeoTemplateListFilters,
  SeoTemplateListItem,
} from "@/types/seo-templates";
import type { SeoTemplateLanguage, SeoTemplateOwnerType } from "@/constants/seo-templates";

function buildTemplateWhere(filters: SeoTemplateListFilters): SQL | undefined {
  const conditions: SQL[] = [];

  if (filters.ownerType) {
    conditions.push(eq(seoTemplates.ownerType, filters.ownerType));
  }

  if (filters.language) {
    conditions.push(eq(seoTemplates.language, filters.language));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function mapTemplateDetail(row: typeof seoTemplates.$inferSelect): SeoTemplateDetail {
  return {
    id: row.id,
    ownerType: row.ownerType as SeoTemplateOwnerType,
    language: row.language as SeoTemplateLanguage,
    name: row.name,
    metaTitleTemplate: row.metaTitleTemplate,
    metaDescriptionTemplate: row.metaDescriptionTemplate,
    ogTitleTemplate: row.ogTitleTemplate,
    ogDescriptionTemplate: row.ogDescriptionTemplate,
    isDefault: row.isDefault,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function clearDefaultTemplates(
  tx: ReturnType<typeof getDb>,
  ownerType: SeoTemplateOwnerType,
  language: SeoTemplateLanguage,
  excludeTemplateId?: string,
): Promise<void> {
  const conditions: SQL[] = [
    eq(seoTemplates.ownerType, ownerType),
    eq(seoTemplates.language, language),
    eq(seoTemplates.isDefault, true),
  ];

  const rows = await tx
    .select({ id: seoTemplates.id })
    .from(seoTemplates)
    .where(and(...conditions));

  for (const row of rows) {
    if (excludeTemplateId && row.id === excludeTemplateId) {
      continue;
    }

    await tx
      .update(seoTemplates)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(seoTemplates.id, row.id));
  }
}

export async function findSeoTemplates(
  filters: SeoTemplateListFilters = {},
): Promise<SeoTemplateListItem[]> {
  const db = getDb();
  const whereClause = buildTemplateWhere(filters);

  const rows = await db
    .select()
    .from(seoTemplates)
    .where(whereClause)
    .orderBy(desc(seoTemplates.isDefault), desc(seoTemplates.updatedAt));

  return rows.map((row) => ({
    id: row.id,
    ownerType: row.ownerType as SeoTemplateOwnerType,
    language: row.language as SeoTemplateLanguage,
    name: row.name,
    isDefault: row.isDefault,
    updatedAt: row.updatedAt,
  }));
}

export async function findSeoTemplateById(id: string): Promise<SeoTemplateDetail | null> {
  const db = getDb();

  const [row] = await db.select().from(seoTemplates).where(eq(seoTemplates.id, id)).limit(1);

  return row ? mapTemplateDetail(row) : null;
}

export async function findDefaultSeoTemplate(
  ownerType: SeoTemplateOwnerType,
  language: SeoTemplateLanguage,
): Promise<SeoTemplateDetail | null> {
  const db = getDb();

  const [row] = await db
    .select()
    .from(seoTemplates)
    .where(
      and(
        eq(seoTemplates.ownerType, ownerType),
        eq(seoTemplates.language, language),
        eq(seoTemplates.isDefault, true),
      ),
    )
    .limit(1);

  return row ? mapTemplateDetail(row) : null;
}

export async function insertSeoTemplate(input: SeoTemplateFormInput): Promise<string> {
  return withTransaction(async (tx) => {
    if (input.isDefault) {
      await clearDefaultTemplates(tx as unknown as ReturnType<typeof getDb>, input.ownerType, input.language);
    }

    const [created] = await tx
      .insert(seoTemplates)
      .values({
        ownerType: input.ownerType,
        language: input.language,
        name: input.name,
        metaTitleTemplate: input.metaTitleTemplate,
        metaDescriptionTemplate: input.metaDescriptionTemplate,
        ogTitleTemplate: input.ogTitleTemplate,
        ogDescriptionTemplate: input.ogDescriptionTemplate,
        isDefault: input.isDefault,
      })
      .returning({ id: seoTemplates.id });

    if (!created) {
      throw new Error("Failed to create SEO template");
    }

    return created.id;
  });
}

export async function updateSeoTemplateRecord(
  id: string,
  input: SeoTemplateFormInput,
): Promise<void> {
  await withTransaction(async (tx) => {
    if (input.isDefault) {
      await clearDefaultTemplates(
        tx as unknown as ReturnType<typeof getDb>,
        input.ownerType,
        input.language,
        id,
      );
    }

    await tx
      .update(seoTemplates)
      .set({
        ownerType: input.ownerType,
        language: input.language,
        name: input.name,
        metaTitleTemplate: input.metaTitleTemplate,
        metaDescriptionTemplate: input.metaDescriptionTemplate,
        ogTitleTemplate: input.ogTitleTemplate,
        ogDescriptionTemplate: input.ogDescriptionTemplate,
        isDefault: input.isDefault,
        updatedAt: new Date(),
      })
      .where(eq(seoTemplates.id, id));
  });
}

export async function deleteSeoTemplateById(id: string): Promise<boolean> {
  const db = getDb();
  const result = await db.delete(seoTemplates).where(eq(seoTemplates.id, id));

  return (result.count ?? 0) > 0;
}
