"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { attachPageMedia } from "@/services/pageMediaService";
import { attachPageMediaSchema } from "@/schemas/media/entityMediaSchemas";

import type { ServerActionResult } from "@/types";
import type { PageMediaMutationResult } from "@/services/pageMediaService";

export async function attachPageMediaAction(
  pageId: string,
  mediaAssetId: string,
  usageType: "cover" | "gallery" = "gallery",
): Promise<ServerActionResult<PageMediaMutationResult>> {
  const parsed = attachPageMediaSchema.safeParse({ pageId, mediaAssetId, usageType });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await attachPageMedia(
      parsed.data.pageId,
      parsed.data.mediaAssetId,
      parsed.data.usageType,
      context,
    );

    revalidatePath(`/admin/pages/${parsed.data.pageId}`);
    revalidatePath("/admin/pages");
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
