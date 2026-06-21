import { AUDIT_ACTION_LABELS, HISTORY_ENTITY_LABELS, HISTORY_OPERATION_LABELS } from "@/constants/audit";
import { stringifyCsv } from "@/lib/import-export/csv";
import { maskRecord } from "@/lib/import-export/maskSensitiveData";
import {
  findHistoryAuditRowsForExport,
  findSecurityAuditRowsForExport,
} from "@/repositories/auditExportRepository";
import { emitWebhookEvent } from "@/services/webhookService";

import type { AuditExportRequest, ExportFilePayload } from "@/types/import-export";
import type { HistoryAuditListFilters, SecurityAuditListFilters } from "@/types/audit";

function buildFilename(source: AuditExportRequest["source"], format: AuditExportRequest["format"]): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `audit-${source}-${timestamp}.${format}`;
}

function serializeSecurityRowsCsv(
  rows: Awaited<ReturnType<typeof findSecurityAuditRowsForExport>>,
): string {
  const headers = ["id", "action", "actor", "ip_address", "user_agent", "created_at"] as const;

  return stringifyCsv(
    headers,
    rows.map((row) => ({
      id: row.id,
      action: AUDIT_ACTION_LABELS[row.action] ?? row.action,
      actor: row.actorName ?? "",
      ip_address: row.ipAddress ?? "",
      user_agent: row.userAgent ?? "",
      created_at: row.createdAt.toISOString(),
    })),
  );
}

function serializeHistoryRowsCsv(
  rows: Awaited<ReturnType<typeof findHistoryAuditRowsForExport>>,
): string {
  const headers = [
    "id",
    "entity_type",
    "entity_id",
    "operation",
    "summary",
    "actor",
    "ip_address",
    "is_system_action",
    "changed_fields",
    "created_at",
  ] as const;

  return stringifyCsv(
    headers,
    rows.map((row) => ({
      id: row.id,
      entity_type: HISTORY_ENTITY_LABELS[row.entityType] ?? row.entityType,
      entity_id: row.entityId,
      operation: HISTORY_OPERATION_LABELS[row.operation] ?? row.operation,
      summary: row.changeSummary,
      actor: row.actorName ?? "",
      ip_address: row.ipAddress ?? "",
      is_system_action: row.isSystemAction ? "true" : "false",
      changed_fields: row.changedFields?.join("|") ?? "",
      created_at: row.createdAt.toISOString(),
    })),
  );
}

export async function exportAuditLog(request: AuditExportRequest): Promise<ExportFilePayload> {
  let payload: ExportFilePayload;

  if (request.source === "security") {
    const filters: SecurityAuditListFilters = {
      page: 1,
      pageSize: 25,
      search: request.search,
      action: request.action as SecurityAuditListFilters["action"],
    };

    const rows = await findSecurityAuditRowsForExport(filters);

    payload =
      request.format === "json"
        ? {
            filename: buildFilename(request.source, request.format),
            mimeType: "application/json",
            content: JSON.stringify(
              rows.map((row) => ({
                id: row.id,
                action: row.action,
                actorName: row.actorName,
                ipAddress: row.ipAddress,
                userAgent: row.userAgent,
                createdAt: row.createdAt.toISOString(),
              })),
              null,
              2,
            ),
          }
        : {
            filename: buildFilename(request.source, request.format),
            mimeType: "text/csv;charset=utf-8",
            content: serializeSecurityRowsCsv(rows),
          };
  } else {
    const filters: HistoryAuditListFilters = {
      page: 1,
      pageSize: 25,
      search: request.search,
      entityType: request.entityType,
      operation: request.operation,
    };

    const rows = await findHistoryAuditRowsForExport(filters);

    payload =
      request.format === "json"
        ? {
            filename: buildFilename(request.source, request.format),
            mimeType: "application/json",
            content: JSON.stringify(
              rows.map((row) => ({
                id: row.id,
                entityType: row.entityType,
                entityId: row.entityId,
                operation: row.operation,
                changeSummary: row.changeSummary,
                actorName: row.actorName,
                ipAddress: row.ipAddress,
                userAgent: row.userAgent,
                isSystemAction: row.isSystemAction,
                beforeData: row.beforeData ? maskRecord(row.beforeData) : null,
                afterData: row.afterData ? maskRecord(row.afterData) : null,
                changedFields: row.changedFields,
                createdAt: row.createdAt.toISOString(),
              })),
              null,
              2,
            ),
          }
        : {
            filename: buildFilename(request.source, request.format),
            mimeType: "text/csv;charset=utf-8",
            content: serializeHistoryRowsCsv(rows),
          };
  }

  emitWebhookEvent("export.completed", {
    source: request.source,
    format: request.format,
    filename: payload.filename,
  });

  return payload;
}
