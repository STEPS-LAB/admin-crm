"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { reorderBrandGallery } from "@/services/brandMediaService";
import { reorderBrandGallerySchema } from "@/schemas/media/entityMediaSchemas";

import type { ServerActionResult } from "@/types";

export async function reorderBrandGalleryAction(
  brandId: string,
  usageIds: string[],
): Promise<ServerActionResult<{ brandId: string }>> {
  const parsed = reorderBrandGallerySchema.safeParse({ brandId, usageIds });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await reorderBrandGallery(parsed.data.brandId, parsed.data.usageIds, context);
    revalidatePath(`/admin/brands/${parsed.data.brandId}`);
    return { success: true, data: { brandId: parsed.data.brandId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder gallery",
      code: "REORDER_FAILED",
    };
  }
}
