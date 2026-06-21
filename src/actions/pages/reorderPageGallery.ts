"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { reorderPageGallery } from "@/services/pageMediaService";
import { reorderPageGallerySchema } from "@/schemas/media/entityMediaSchemas";

import type { ServerActionResult } from "@/types";

export async function reorderPageGalleryAction(
  pageId: string,
  usageIds: string[],
): Promise<ServerActionResult<{ pageId: string }>> {
  const parsed = reorderPageGallerySchema.safeParse({ pageId, usageIds });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await reorderPageGallery(parsed.data.pageId, parsed.data.usageIds, context);
    revalidatePath(`/admin/pages/${parsed.data.pageId}`);
    return { success: true, data: { pageId: parsed.data.pageId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder gallery",
      code: "REORDER_FAILED",
    };
  }
}
