"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import {
  bulkDeleteCategories,
  bulkDeleteProducts,
  bulkUpdateCategoryStatus,
  bulkUpdateProductStatus,
  reorderCategories,
} from "@/services/catalogBulkService";
import {
  bulkCategoryStatusSchema,
  bulkEntityIdsSchema,
  bulkProductStatusSchema,
  reorderCategoriesSchema,
} from "@/schemas/catalog/bulkSchemas";

import type { BulkOperationResult } from "@/types/catalog-bulk";
import type { ServerActionResult } from "@/types";

function formatBulkResult(result: BulkOperationResult): ServerActionResult<BulkOperationResult> {
  if (result.succeededIds.length === 0 && result.failures.length > 0) {
    return {
      success: false,
      error: result.failures[0]?.error ?? "Bulk operation failed",
      code: "BULK_OPERATION_FAILED",
    };
  }

  return { success: true, data: result };
}

function revalidateCatalogPaths(): void {
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/catalog/trash");
}

export async function bulkUpdateProductStatusAction(
  input: unknown,
): Promise<ServerActionResult<BulkOperationResult>> {
  const parsed = bulkProductStatusSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid bulk status update", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await bulkUpdateProductStatus(parsed.data.ids, parsed.data.status, context);
    revalidateCatalogPaths();
    return formatBulkResult(result);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bulk status update failed",
      code: "BULK_STATUS_UPDATE_FAILED",
    };
  }
}

export async function bulkDeleteProductsAction(
  input: unknown,
): Promise<ServerActionResult<BulkOperationResult>> {
  const parsed = bulkEntityIdsSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid bulk delete request", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await bulkDeleteProducts(parsed.data.ids, context);
    revalidateCatalogPaths();
    return formatBulkResult(result);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bulk delete failed",
      code: "BULK_DELETE_FAILED",
    };
  }
}

export async function bulkUpdateCategoryStatusAction(
  input: unknown,
): Promise<ServerActionResult<BulkOperationResult>> {
  const parsed = bulkCategoryStatusSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid bulk status update", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await bulkUpdateCategoryStatus(parsed.data.ids, parsed.data.status, context);
    revalidateCatalogPaths();
    return formatBulkResult(result);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bulk status update failed",
      code: "BULK_STATUS_UPDATE_FAILED",
    };
  }
}

export async function bulkDeleteCategoriesAction(
  input: unknown,
): Promise<ServerActionResult<BulkOperationResult>> {
  const parsed = bulkEntityIdsSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid bulk delete request", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await bulkDeleteCategories(parsed.data.ids, context);
    revalidateCatalogPaths();
    return formatBulkResult(result);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bulk delete failed",
      code: "BULK_DELETE_FAILED",
    };
  }
}

export async function reorderCategoriesAction(
  input: unknown,
): Promise<ServerActionResult<{ readonly parentId: string | null }>> {
  const parsed = reorderCategoriesSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid reorder request", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await reorderCategories(parsed.data.parentId, parsed.data.orderedIds, context);
    revalidatePath("/admin/categories");
    return { success: true, data: { parentId: parsed.data.parentId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder categories",
      code: "REORDER_FAILED",
    };
  }
}
