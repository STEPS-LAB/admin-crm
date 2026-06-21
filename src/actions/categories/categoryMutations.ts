"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { changeCategoryStatus, deleteCategory } from "@/services/categoryService";
import { categoryIdSchema, categoryStatusUpdateSchema } from "@/schemas/categories/categorySchemas";

import type { ServerActionResult } from "@/types";

export async function updateCategoryStatusAction(input: {
  id: string;
  status: string;
}): Promise<ServerActionResult<{ id: string }>> {
  const parsed = categoryStatusUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid status update", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await changeCategoryStatus(parsed.data.id, parsed.data.status, context);
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${parsed.data.id}`);
    return { success: true, data: { id: parsed.data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
      code: "STATUS_UPDATE_FAILED",
    };
  }
}

export async function deleteCategoryAction(id: string): Promise<ServerActionResult<{ id: string }>> {
  const parsed = categoryIdSchema.safeParse({ id });

  if (!parsed.success) {
    return { success: false, error: "Invalid category id", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await deleteCategory(parsed.data.id, context);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/catalog/trash");
    return { success: true, data: { id: parsed.data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete category",
      code: "DELETE_FAILED",
    };
  }
}
