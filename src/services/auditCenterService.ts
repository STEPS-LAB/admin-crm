import { findSecurityAuditLogs } from "@/repositories/auditRepository";
import { findHistoryAuditEntries, findHistoryAuditEntryById } from "@/repositories/historyRepository";

import type { Pagination } from "@/types";
import type {
  HistoryAuditDetail,
  HistoryAuditListFilters,
  HistoryAuditListItem,
  SecurityAuditListFilters,
  SecurityAuditListItem,
} from "@/types/audit";

export async function listSecurityAuditLogs(
  filters: SecurityAuditListFilters,
): Promise<Pagination<SecurityAuditListItem>> {
  return findSecurityAuditLogs(filters);
}

export async function listHistoryAuditEntries(
  filters: HistoryAuditListFilters,
): Promise<Pagination<HistoryAuditListItem>> {
  return findHistoryAuditEntries(filters);
}

export async function getHistoryAuditEntry(id: string): Promise<HistoryAuditDetail | null> {
  return findHistoryAuditEntryById(id);
}
