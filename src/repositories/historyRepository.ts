import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { getDb } from "@/db/client";
import { profiles } from "@/db/schema/auth";
import { historyEntries } from "@/db/schema/history";
import { calculatePagination } from "@/repositories/baseRepository";

import type { Pagination } from "@/types";
import type { HistoryAuditDetail, HistoryAuditListFilters, HistoryAuditListItem } from "@/types/audit";

type HistoryEntityType = typeof historyEntries.$inferInsert["entityType"];
type HistoryOperation = typeof historyEntries.$inferInsert["operation"];

export interface CreateHistoryEntryInput {
  readonly entityType: HistoryEntityType;
  readonly entityId: string;
  readonly operation: HistoryOperation;
  readonly performedBy: string | null;
  readonly changeSummary: string;
  readonly beforeData?: Record<string, unknown> | null;
  readonly afterData?: Record<string, unknown> | null;
  readonly changedFields?: string[];
  readonly ipAddress?: string | null;
  readonly userAgent?: string | null;
}

export async function createHistoryEntry(input: CreateHistoryEntryInput): Promise<void> {
  const db = getDb();

  await db.insert(historyEntries).values({
    entityType: input.entityType,
    entityId: input.entityId,
    operation: input.operation,
    performedBy: input.performedBy,
    changeSummary: input.changeSummary,
    beforeData: input.beforeData ?? null,
    afterData: input.afterData ?? null,
    changedFields: input.changedFields ?? null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
  });
}

function buildHistoryWhere(filters: HistoryAuditListFilters): SQL | undefined {
  const conditions: SQL[] = [];

  if (filters.entityType) {
    conditions.push(eq(historyEntries.entityType, filters.entityType as HistoryEntityType));
  }

  if (filters.operation) {
    conditions.push(eq(historyEntries.operation, filters.operation as HistoryOperation));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(historyEntries.changeSummary, term),
        ilike(profiles.displayName, term),
        ilike(historyEntries.ipAddress, term),
      )!,
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function findHistoryAuditEntries(
  filters: HistoryAuditListFilters,
): Promise<Pagination<HistoryAuditListItem>> {
  const db = getDb();
  const whereClause = buildHistoryWhere(filters);
  const offset = (filters.page - 1) * filters.pageSize;

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: historyEntries.id,
        entityType: historyEntries.entityType,
        entityId: historyEntries.entityId,
        operation: historyEntries.operation,
        changeSummary: historyEntries.changeSummary,
        actorName: profiles.displayName,
        ipAddress: historyEntries.ipAddress,
        isSystemAction: historyEntries.isSystemAction,
        createdAt: historyEntries.performedAt,
      })
      .from(historyEntries)
      .leftJoin(profiles, eq(historyEntries.performedBy, profiles.id))
      .where(whereClause)
      .orderBy(desc(historyEntries.performedAt))
      .limit(filters.pageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(historyEntries)
      .leftJoin(profiles, eq(historyEntries.performedBy, profiles.id))
      .where(whereClause),
  ]);

  return calculatePagination(rows, totalRows[0]?.value ?? 0, {
    page: filters.page,
    pageSize: filters.pageSize,
  });
}

export async function findHistoryAuditEntryById(id: string): Promise<HistoryAuditDetail | null> {
  const db = getDb();

  const rows = await db
    .select({
      id: historyEntries.id,
      entityType: historyEntries.entityType,
      entityId: historyEntries.entityId,
      operation: historyEntries.operation,
      changeSummary: historyEntries.changeSummary,
      actorName: profiles.displayName,
      ipAddress: historyEntries.ipAddress,
      userAgent: historyEntries.userAgent,
      isSystemAction: historyEntries.isSystemAction,
      beforeData: historyEntries.beforeData,
      afterData: historyEntries.afterData,
      changedFields: historyEntries.changedFields,
      reason: historyEntries.reason,
      createdAt: historyEntries.performedAt,
    })
    .from(historyEntries)
    .leftJoin(profiles, eq(historyEntries.performedBy, profiles.id))
    .where(eq(historyEntries.id, id))
    .limit(1);

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    entityType: row.entityType,
    entityId: row.entityId,
    operation: row.operation,
    changeSummary: row.changeSummary,
    actorName: row.actorName,
    ipAddress: row.ipAddress,
    userAgent: row.userAgent,
    isSystemAction: row.isSystemAction,
    beforeData: row.beforeData as Record<string, unknown> | null,
    afterData: row.afterData as Record<string, unknown> | null,
    changedFields: row.changedFields as string[] | null,
    reason: row.reason,
    createdAt: row.createdAt,
  };
}
