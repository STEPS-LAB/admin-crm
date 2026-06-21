"use server";

import { enforceExportRateLimit } from "@/actions/guards/listActionGuards";
import { exportCatalogData } from "@/services/catalogExportService";
import { catalogExportRequestSchema } from "@/schemas/import-export/importExportSchemas";

import type { ServerActionResult } from "@/types";
import type { ExportFilePayload } from "@/types/import-export";

export async function exportCatalogAction(
  entity: string,
  format: string,
): Promise<ServerActionResult<ExportFilePayload>> {
  const parsed = catalogExportRequestSchema.safeParse({ entity, format });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid export request";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    await enforceExportRateLimit();
    const payload = await exportCatalogData(parsed.data);
    return { success: true, data: payload };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Export failed",
      code: "EXPORT_FAILED",
    };
  }
}
