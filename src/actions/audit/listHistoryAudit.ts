"use server";

import { enforceListSearchRateLimit } from "@/actions/guards/listActionGuards";
import { listHistoryAuditEntries } from "@/services/auditCenterService";
import { historyAuditFiltersSchema } from "@/schemas/audit/auditSchemas";

import type { Pagination } from "@/types";
import type { HistoryAuditListItem } from "@/types/audit";

export async function listHistoryAuditAction(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<Pagination<HistoryAuditListItem>> {
  const parsed = historyAuditFiltersSchema.safeParse({
    page: rawParams.page,
    pageSize: rawParams.pageSize,
    q: typeof rawParams.q === "string" ? rawParams.q : undefined,
    entityType: typeof rawParams.entityType === "string" ? rawParams.entityType : undefined,
    operation: typeof rawParams.operation === "string" ? rawParams.operation : undefined,
  });

  const filters = parsed.success ? parsed.data : historyAuditFiltersSchema.parse({});

  await enforceListSearchRateLimit(filters.q);

  return listHistoryAuditEntries({
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.q,
    entityType: filters.entityType,
    operation: filters.operation,
  });
}
