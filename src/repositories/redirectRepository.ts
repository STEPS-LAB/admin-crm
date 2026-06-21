import { and, count, desc, eq, ilike, ne, or, type SQL } from "drizzle-orm";

import { getDb } from "@/db/client";
import { redirectRules } from "@/db/schema/seo";
import { calculatePagination } from "@/repositories/baseRepository";

import type { Pagination, PaginationParams } from "@/types";
import type {
  RedirectDetail,
  RedirectFormInput,
  RedirectListFilters,
  RedirectListItem,
} from "@/types/seo-center";

function buildRedirectWhere(filters: RedirectListFilters): SQL | undefined {
  const conditions: SQL[] = [];

  if (filters.enabled !== undefined) {
    conditions.push(eq(redirectRules.enabled, filters.enabled));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(or(ilike(redirectRules.source, term), ilike(redirectRules.destination, term))!);
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function findRedirects(
  filters: RedirectListFilters,
): Promise<Pagination<RedirectListItem>> {
  const db = getDb();
  const whereClause = buildRedirectWhere(filters);
  const offset = (filters.page - 1) * filters.pageSize;

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(redirectRules)
      .where(whereClause)
      .orderBy(desc(redirectRules.updatedAt))
      .limit(filters.pageSize)
      .offset(offset),
    db.select({ value: count() }).from(redirectRules).where(whereClause),
  ]);

  const items: RedirectListItem[] = rows.map((row) => ({
    id: row.id,
    source: row.source,
    destination: row.destination,
    statusCode: row.statusCode,
    enabled: row.enabled,
    hits: row.hits,
    lastHitAt: row.lastHitAt,
    updatedAt: row.updatedAt,
  }));

  const paginationParams: PaginationParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  };

  return calculatePagination(items, totalResult[0]?.value ?? 0, paginationParams);
}

export async function findRedirectById(id: string): Promise<RedirectDetail | null> {
  const db = getDb();

  const [row] = await db.select().from(redirectRules).where(eq(redirectRules.id, id)).limit(1);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    source: row.source,
    destination: row.destination,
    statusCode: row.statusCode,
    enabled: row.enabled,
    hits: row.hits,
    lastHitAt: row.lastHitAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function sourceExists(source: string, excludeId?: string): Promise<boolean> {
  const db = getDb();
  const conditions: SQL[] = [eq(redirectRules.source, source)];

  if (excludeId) {
    conditions.push(ne(redirectRules.id, excludeId));
  }

  const result = await db
    .select({ value: count() })
    .from(redirectRules)
    .where(and(...conditions));

  return (result[0]?.value ?? 0) > 0;
}

export async function insertRedirect(input: RedirectFormInput): Promise<string> {
  const db = getDb();

  const [created] = await db
    .insert(redirectRules)
    .values({
      source: input.source,
      destination: input.destination,
      statusCode: input.statusCode,
      enabled: input.enabled,
    })
    .returning({ id: redirectRules.id });

  if (!created) {
    throw new Error("Failed to create redirect");
  }

  return created.id;
}

export async function updateRedirectRecord(id: string, input: RedirectFormInput): Promise<void> {
  const db = getDb();

  await db
    .update(redirectRules)
    .set({
      source: input.source,
      destination: input.destination,
      statusCode: input.statusCode,
      enabled: input.enabled,
      updatedAt: new Date(),
    })
    .where(eq(redirectRules.id, id));
}

export async function deleteRedirectRecord(id: string): Promise<boolean> {
  const db = getDb();

  const result = await db.delete(redirectRules).where(eq(redirectRules.id, id));

  return (result.count ?? 0) > 0;
}

export async function findRedirectBySource(source: string): Promise<RedirectDetail | null> {
  const db = getDb();

  const [row] = await db
    .select()
    .from(redirectRules)
    .where(eq(redirectRules.source, source))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    source: row.source,
    destination: row.destination,
    statusCode: row.statusCode,
    enabled: row.enabled,
    hits: row.hits,
    lastHitAt: row.lastHitAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
