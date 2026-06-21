"use server";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { enforceImportRateLimit } from "@/actions/guards/listActionGuards";
import {
  commitCatalogImport,
  previewCatalogImport,
  rollbackCatalogImport,
} from "@/services/catalogImportService";
import {
  catalogImportCommitSchema,
  catalogImportPreviewSchema,
  catalogImportRollbackSchema,
} from "@/schemas/import-export/importExportSchemas";

import type { ServerActionResult } from "@/types";
import type {
  CatalogImportCommitResult,
  CatalogImportPreview,
  CatalogImportRollbackResult,
} from "@/types/import-export";

export async function previewCatalogImportAction(
  entity: string,
  format: string,
  content: string,
): Promise<ServerActionResult<CatalogImportPreview>> {
  const parsed = catalogImportPreviewSchema.safeParse({ entity, format, content });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid import file";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    await enforceImportRateLimit();
    const preview = await previewCatalogImport(
      parsed.data.entity,
      parsed.data.format,
      parsed.data.content,
    );
    return { success: true, data: preview };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Import preview failed",
      code: "PREVIEW_FAILED",
    };
  }
}

export async function commitCatalogImportAction(
  entity: string,
  rows: Record<string, unknown>[],
): Promise<ServerActionResult<CatalogImportCommitResult>> {
  const parsed = catalogImportCommitSchema.safeParse({ entity, rows });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid import payload";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    await enforceImportRateLimit();
    const context = await buildMutationContext();
    const result = await commitCatalogImport(parsed.data.entity, parsed.data.rows, context);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Import commit failed",
      code: "COMMIT_FAILED",
    };
  }
}

export async function rollbackCatalogImportAction(
  createdProductIds: string[],
  createdCategoryIds: string[],
): Promise<ServerActionResult<CatalogImportRollbackResult>> {
  const parsed = catalogImportRollbackSchema.safeParse({
    createdProductIds,
    createdCategoryIds,
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid rollback payload";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await rollbackCatalogImport(
      parsed.data.createdProductIds,
      parsed.data.createdCategoryIds,
      context,
    );
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Import rollback failed",
      code: "ROLLBACK_FAILED",
    };
  }
}
