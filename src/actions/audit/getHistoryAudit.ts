"use server";

import { getHistoryAuditEntry } from "@/services/auditCenterService";
import { historyAuditIdSchema } from "@/schemas/audit/auditSchemas";

import type { HistoryAuditDetail } from "@/types/audit";

export async function getHistoryAuditAction(id: string): Promise<HistoryAuditDetail | null> {
  const parsed = historyAuditIdSchema.safeParse({ id });

  if (!parsed.success) {
    return null;
  }

  return getHistoryAuditEntry(parsed.data.id);
}
