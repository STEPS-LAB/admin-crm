import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { IMPORT_EXPORT_LIMITS } from "@/constants/import-export";
import { getDb } from "@/db/client";
import { auditLogs, profiles } from "@/db/schema";
import { historyEntries } from "@/db/schema/history";

import type { AuditActionType } from "@/types/auth";
import type { SecurityAuditListFilters } from "@/types/audit";
import type { HistoryAuditListFilters } from "@/types/audit";

export interface SecurityAuditExportRow {
  readonly id: string;
  readonly action: AuditActionType;
  readonly actorName: string | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly createdAt: Date;
}

export interface HistoryAuditExportRow {
  readonly id: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly operation: string;
  readonly changeSummary: string;
  readonly actorName: string | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly isSystemAction: boolean;
  readonly beforeData: Record<string, unknown> | null;
  readonly afterData: Record<string, unknown> | null;
  readonly changedFields: string[] | null;
  readonly createdAt: Date;
}

function buildSecurityWhere(filters: SecurityAuditListFilters): SQL | undefined {
  const conditions: SQL[] = [];

  if (filters.action) {
    conditions.push(eq(auditLogs.action, filters.action));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(profiles.displayName, term),
        ilike(auditLogs.ipAddress, term),
        ilike(auditLogs.userAgent, term),
      )!,
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function buildHistoryWhere(filters: HistoryAuditListFilters): SQL | undefined {
  const conditions: SQL[] = [];

  if (filters.entityType) {
    conditions.push(eq(historyEntries.entityType, filters.entityType as typeof historyEntries.$inferInsert.entityType));
  }

  if (filters.operation) {
    conditions.push(eq(historyEntries.operation, filters.operation as typeof historyEntries.$inferInsert.operation));
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

export async function findSecurityAuditRowsForExport(
  filters: SecurityAuditListFilters,
): Promise<readonly SecurityAuditExportRow[]> {
  const db = getDb();
  const whereClause = buildSecurityWhere(filters);

  return db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      actorName: profiles.displayName,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(profiles, eq(auditLogs.profileId, profiles.id))
    .where(whereClause)
    .orderBy(desc(auditLogs.createdAt))
    .limit(IMPORT_EXPORT_LIMITS.maxExportRows);
}

export async function findHistoryAuditRowsForExport(
  filters: HistoryAuditListFilters,
): Promise<readonly HistoryAuditExportRow[]> {
  const db = getDb();
  const whereClause = buildHistoryWhere(filters);

  return db
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
      createdAt: historyEntries.performedAt,
    })
    .from(historyEntries)
    .leftJoin(profiles, eq(historyEntries.performedBy, profiles.id))
    .where(whereClause)
    .orderBy(desc(historyEntries.performedAt))
    .limit(IMPORT_EXPORT_LIMITS.maxExportRows)
    .then((rows) =>
      rows.map((row) => ({
        ...row,
        beforeData: (row.beforeData as Record<string, unknown> | null) ?? null,
        afterData: (row.afterData as Record<string, unknown> | null) ?? null,
        changedFields: (row.changedFields as string[] | null) ?? null,
      })),
    );
}
