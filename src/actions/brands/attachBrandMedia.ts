"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { attachBrandMedia } from "@/services/brandMediaService";
import { attachBrandMediaSchema } from "@/schemas/media/entityMediaSchemas";

import type { ServerActionResult } from "@/types";
import type { BrandMediaMutationResult } from "@/services/brandMediaService";

export async function attachBrandMediaAction(
  brandId: string,
  mediaAssetId: string,
  usageType: "cover" | "gallery" = "gallery",
): Promise<ServerActionResult<BrandMediaMutationResult>> {
  const parsed = attachBrandMediaSchema.safeParse({ brandId, mediaAssetId, usageType });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await attachBrandMedia(
      parsed.data.brandId,
      parsed.data.mediaAssetId,
      parsed.data.usageType,
      context,
    );

    revalidatePath(`/admin/brands/${parsed.data.brandId}`);
    revalidatePath("/admin/brands");
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
