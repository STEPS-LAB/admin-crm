import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { getDb } from "@/db/client";
import { auditLogs, profiles } from "@/db/schema";
import { calculatePagination } from "@/repositories/baseRepository";

import type { AuditActionType } from "@/types/auth";
import type { Pagination } from "@/types";
import type { SecurityAuditListFilters, SecurityAuditListItem } from "@/types/audit";

export interface CreateAuditLogInput {
  readonly profileId: string | null;
  readonly action: AuditActionType;
  readonly ipAddress?: string | null;
  readonly userAgent?: string | null;
}

export async function createAuditLog(input: CreateAuditLogInput): Promise<void> {
  const db = getDb();

  await db.insert(auditLogs).values({
    profileId: input.profileId,
    action: input.action,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
  });
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

export async function findSecurityAuditLogs(
  filters: SecurityAuditListFilters,
): Promise<Pagination<SecurityAuditListItem>> {
  const db = getDb();
  const whereClause = buildSecurityWhere(filters);
  const offset = (filters.page - 1) * filters.pageSize;

  const [rows, totalRows] = await Promise.all([
    db
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
      .limit(filters.pageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(auditLogs)
      .leftJoin(profiles, eq(auditLogs.profileId, profiles.id))
      .where(whereClause),
  ]);

  return calculatePagination(rows, totalRows[0]?.value ?? 0, {
    page: filters.page,
    pageSize: filters.pageSize,
  });
}
