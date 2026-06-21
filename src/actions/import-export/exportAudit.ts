"use server";

import { enforceExportRateLimit } from "@/actions/guards/listActionGuards";
import { exportAuditLog } from "@/services/auditExportService";
import { auditExportRequestSchema } from "@/schemas/import-export/importExportSchemas";

import type { ServerActionResult } from "@/types";
import type { ExportFilePayload } from "@/types/import-export";

export async function exportAuditAction(
  input: Record<string, string | undefined>,
): Promise<ServerActionResult<ExportFilePayload>> {
  const parsed = auditExportRequestSchema.safeParse(input);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid export request";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    await enforceExportRateLimit();

    const payload = await exportAuditLog(
      parsed.data.source === "history"
        ? {
            source: "history",
            format: parsed.data.format,
            search: parsed.data.q,
            entityType: parsed.data.entityType,
            operation: parsed.data.operation,
          }
        : {
            source: "security",
            format: parsed.data.format,
            search: parsed.data.q,
            action: parsed.data.action,
          },
    );

    return { success: true, data: payload };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Audit export failed",
      code: "EXPORT_FAILED",
    };
  }
}
