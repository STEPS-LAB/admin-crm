"use server";

import { enforceListSearchRateLimit } from "@/actions/guards/listActionGuards";
import { listSecurityAuditLogs } from "@/services/auditCenterService";
import { securityAuditFiltersSchema } from "@/schemas/audit/auditSchemas";

import type { Pagination } from "@/types";
import type { SecurityAuditListItem } from "@/types/audit";

export async function listSecurityAuditAction(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<Pagination<SecurityAuditListItem>> {
  const parsed = securityAuditFiltersSchema.safeParse({
    page: rawParams.page,
    pageSize: rawParams.pageSize,
    q: typeof rawParams.q === "string" ? rawParams.q : undefined,
    action: typeof rawParams.action === "string" ? rawParams.action : undefined,
  });

  const filters = parsed.success ? parsed.data : securityAuditFiltersSchema.parse({});

  await enforceListSearchRateLimit(filters.q);

  return listSecurityAuditLogs({
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.q,
    action: filters.action,
  });
}
