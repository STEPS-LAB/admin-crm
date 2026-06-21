import { and, count, eq, isNotNull, isNull, type SQL } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";

import { getDb } from "@/db/client";
import type { Pagination, PaginationParams } from "@/types";

export function calculatePagination<T>(
  items: T[],
  total: number,
  params: PaginationParams,
): Pagination<T> {
  const totalPages = Math.max(1, Math.ceil(total / params.pageSize));

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1,
  };
}

export function softDeleteFilter(deletedAtColumn: PgColumn): SQL {
  return isNull(deletedAtColumn);
}

export async function withTransaction<T>(
  callback: (tx: ReturnType<typeof getDb>) => Promise<T>,
): Promise<T> {
  const db = getDb();
  return db.transaction(async (tx) => callback(tx as unknown as ReturnType<typeof getDb>));
}

export async function paginateTable<TRow extends Record<string, unknown>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: PgTable<any>,
  deletedAtColumn: PgColumn,
  params: PaginationParams,
  options?: {
    readonly where?: SQL | undefined;
    readonly includeSoftDeleted?: boolean;
  },
): Promise<Pagination<TRow>> {
  const db = getDb();
  const offset = (params.page - 1) * params.pageSize;

  const conditions: SQL[] = [];

  if (!options?.includeSoftDeleted) {
    conditions.push(softDeleteFilter(deletedAtColumn));
  }

  if (options?.where) {
    conditions.push(options.where);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalResult] = await Promise.all([
    db.select().from(table).where(whereClause).limit(params.pageSize).offset(offset),
    db.select({ value: count() }).from(table).where(whereClause),
  ]);

  const total = totalResult[0]?.value ?? 0;

  return calculatePagination(rows as TRow[], total, params);
}

export async function softDeleteById(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: PgTable<any>,
  idColumn: PgColumn,
  deletedAtColumn: PgColumn,
  id: string,
): Promise<boolean> {
  const db = getDb();

  const result = await db
    .update(table)
    .set({ deletedAt: new Date() })
    .where(and(eq(idColumn, id), isNull(deletedAtColumn)));

  return (result.count ?? 0) > 0;
}

export async function restoreById(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: PgTable<any>,
  idColumn: PgColumn,
  deletedAtColumn: PgColumn,
  id: string,
): Promise<boolean> {
  const db = getDb();

  const result = await db
    .update(table)
    .set({ deletedAt: null })
    .where(and(eq(idColumn, id), isNotNull(deletedAtColumn)));

  return (result.count ?? 0) > 0;
}
