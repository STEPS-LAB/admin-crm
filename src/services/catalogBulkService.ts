import type { CategoryStatus } from "@/constants/categories";
import type { ProductStatus } from "@/constants/products";
import {
  changeCategoryStatus,
  deleteCategory,
  reorderCategorySiblings,
} from "@/services/categoryService";
import {
  changeProductStatus,
  deleteProduct,
} from "@/services/productService";
import type { HistoryMutationContext } from "@/services/historyService";

import type { BulkOperationResult } from "@/types/catalog-bulk";

async function runBulkOperation(
  ids: string[],
  operation: (id: string) => Promise<void>,
): Promise<BulkOperationResult> {
  const succeededIds: string[] = [];
  const failures: Array<{ id: string; error: string }> = [];

  for (const id of ids) {
    try {
      await operation(id);
      succeededIds.push(id);
    } catch (error) {
      failures.push({
        id,
        error: error instanceof Error ? error.message : "Operation failed",
      });
    }
  }

  return { succeededIds, failures };
}

export async function bulkUpdateProductStatus(
  ids: string[],
  status: ProductStatus,
  context: HistoryMutationContext,
): Promise<BulkOperationResult> {
  return runBulkOperation(ids, async (id) => {
    await changeProductStatus(id, status, context);
  });
}

export async function bulkDeleteProducts(
  ids: string[],
  context: HistoryMutationContext,
): Promise<BulkOperationResult> {
  return runBulkOperation(ids, async (id) => {
    await deleteProduct(id, context);
  });
}

export async function bulkUpdateCategoryStatus(
  ids: string[],
  status: CategoryStatus,
  context: HistoryMutationContext,
): Promise<BulkOperationResult> {
  return runBulkOperation(ids, async (id) => {
    await changeCategoryStatus(id, status, context);
  });
}

export async function bulkDeleteCategories(
  ids: string[],
  context: HistoryMutationContext,
): Promise<BulkOperationResult> {
  return runBulkOperation(ids, async (id) => {
    await deleteCategory(id, context);
  });
}

export async function reorderCategories(
  parentId: string | null,
  orderedIds: string[],
  context: HistoryMutationContext,
): Promise<void> {
  await reorderCategorySiblings(parentId, orderedIds, context);
}
