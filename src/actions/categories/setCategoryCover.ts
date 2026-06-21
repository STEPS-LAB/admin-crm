"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { setCategoryCover } from "@/services/categoryMediaService";
import { setCategoryCoverSchema } from "@/schemas/media/entityMediaSchemas";

import type { ServerActionResult } from "@/types";
import type { CategoryMediaMutationResult } from "@/services/categoryMediaService";

export async function setCategoryCoverAction(
  categoryId: string,
  mediaAssetId: string,
): Promise<ServerActionResult<CategoryMediaMutationResult>> {
  const parsed = setCategoryCoverSchema.safeParse({ categoryId, mediaAssetId });

  if (!parsed.success) {
    return { success: false, error: "Invalid input", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await setCategoryCover(parsed.data.categoryId, parsed.data.mediaAssetId, context);
    revalidatePath(`/admin/categories/${parsed.data.categoryId}`);
    revalidatePath("/admin/categories");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to set cover",
      code: "UPDATE_FAILED",
    };
  }
}
