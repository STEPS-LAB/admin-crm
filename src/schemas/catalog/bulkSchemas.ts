import { z } from "zod";

import { BULK_OPERATION_MAX_IDS } from "@/constants/catalog";
import { PRODUCT_STATUSES } from "@/constants/products";
import { CATEGORY_STATUSES } from "@/constants/categories";

export const bulkEntityIdsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(BULK_OPERATION_MAX_IDS),
});

export const bulkProductStatusSchema = bulkEntityIdsSchema.extend({
  status: z.enum(PRODUCT_STATUSES),
});

export const bulkCategoryStatusSchema = bulkEntityIdsSchema.extend({
  status: z.enum(CATEGORY_STATUSES),
});

export const reorderCategoriesSchema = z.object({
  parentId: z.string().uuid().nullable(),
  orderedIds: z.array(z.string().uuid()).min(1).max(BULK_OPERATION_MAX_IDS),
});

export type BulkEntityIdsInput = z.infer<typeof bulkEntityIdsSchema>;
export type BulkProductStatusInput = z.infer<typeof bulkProductStatusSchema>;
export type BulkCategoryStatusInput = z.infer<typeof bulkCategoryStatusSchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
