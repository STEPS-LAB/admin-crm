"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { reorderCategoryGallery } from "@/services/categoryMediaService";
import { reorderCategoryGallerySchema } from "@/schemas/media/entityMediaSchemas";

import type { ServerActionResult } from "@/types";

export async function reorderCategoryGalleryAction(
  categoryId: string,
  usageIds: string[],
): Promise<ServerActionResult<{ categoryId: string }>> {
  const parsed = reorderCategoryGallerySchema.safeParse({ categoryId, usageIds });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await reorderCategoryGallery(parsed.data.categoryId, parsed.data.usageIds, context);
    revalidatePath(`/admin/categories/${parsed.data.categoryId}`);
    return { success: true, data: { categoryId: parsed.data.categoryId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder gallery",
      code: "REORDER_FAILED",
    };
  }
}
