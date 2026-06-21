"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { setPageCover } from "@/services/pageMediaService";
import { setPageCoverSchema } from "@/schemas/media/entityMediaSchemas";

import type { ServerActionResult } from "@/types";
import type { PageMediaMutationResult } from "@/services/pageMediaService";

export async function setPageCoverAction(
  pageId: string,
  mediaAssetId: string,
): Promise<ServerActionResult<PageMediaMutationResult>> {
  const parsed = setPageCoverSchema.safeParse({ pageId, mediaAssetId });

  if (!parsed.success) {
    return { success: false, error: "Invalid input", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await setPageCover(parsed.data.pageId, parsed.data.mediaAssetId, context);
    revalidatePath(`/admin/pages/${parsed.data.pageId}`);
    revalidatePath("/admin/pages");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to set cover",
      code: "UPDATE_FAILED",
    };
  }
}
