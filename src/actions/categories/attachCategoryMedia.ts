"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { attachCategoryMedia } from "@/services/categoryMediaService";
import { attachCategoryMediaSchema } from "@/schemas/media/entityMediaSchemas";

import type { ServerActionResult } from "@/types";
import type { CategoryMediaMutationResult } from "@/services/categoryMediaService";

export async function attachCategoryMediaAction(
  categoryId: string,
  mediaAssetId: string,
  usageType: "cover" | "gallery" = "gallery",
): Promise<ServerActionResult<CategoryMediaMutationResult>> {
  const parsed = attachCategoryMediaSchema.safeParse({ categoryId, mediaAssetId, usageType });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await attachCategoryMedia(
      parsed.data.categoryId,
      parsed.data.mediaAssetId,
      parsed.data.usageType,
      context,
    );

    revalidatePath(`/admin/categories/${parsed.data.categoryId}`);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/media");

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to attach media",
      code: "ATTACH_FAILED",
    };
  }
}
