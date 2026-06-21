"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { setBrandCover } from "@/services/brandMediaService";
import { setBrandCoverSchema } from "@/schemas/media/entityMediaSchemas";

import type { ServerActionResult } from "@/types";
import type { BrandMediaMutationResult } from "@/services/brandMediaService";

export async function setBrandCoverAction(
  brandId: string,
  mediaAssetId: string,
): Promise<ServerActionResult<BrandMediaMutationResult>> {
  const parsed = setBrandCoverSchema.safeParse({ brandId, mediaAssetId });

  if (!parsed.success) {
    return { success: false, error: "Invalid input", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await setBrandCover(parsed.data.brandId, parsed.data.mediaAssetId, context);
    revalidatePath(`/admin/brands/${parsed.data.brandId}`);
    revalidatePath("/admin/brands");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to set cover",
      code: "UPDATE_FAILED",
    };
  }
}
