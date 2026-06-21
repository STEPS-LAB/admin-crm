"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { detachCategoryMedia } from "@/services/categoryMediaService";
import { detachCategoryMediaSchema } from "@/schemas/media/entityMediaSchemas";

import type { ServerActionResult } from "@/types";

export async function detachCategoryMediaAction(
  categoryId: string,
  usageId: string,
): Promise<ServerActionResult<{ usageId: string }>> {
  const parsed = detachCategoryMediaSchema.safeParse({ categoryId, usageId });

  if (!parsed.success) {
    return { success: false, error: "Invalid input", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await detachCategoryMedia(parsed.data.categoryId, parsed.data.usageId, context);
    revalidatePath(`/admin/categories/${parsed.data.categoryId}`);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/media");
    return { success: true, data: { usageId: parsed.data.usageId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to detach media",
      code: "DETACH_FAILED",
    };
  }
}
