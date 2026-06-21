"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { attachProductMedia } from "@/services/productMediaService";
import { attachProductMediaSchema } from "@/schemas/products/productMediaSchemas";

import type { ServerActionResult } from "@/types";
import type { ProductMediaMutationResult } from "@/services/productMediaService";

export async function attachProductMediaAction(
  productId: string,
  mediaAssetId: string,
  usageType: "cover" | "gallery" = "gallery",
): Promise<ServerActionResult<ProductMediaMutationResult>> {
  const parsed = attachProductMediaSchema.safeParse({ productId, mediaAssetId, usageType });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await attachProductMedia(
      parsed.data.productId,
      parsed.data.mediaAssetId,
      parsed.data.usageType,
      context,
    );

    revalidatePath(`/admin/products/${parsed.data.productId}`);
    revalidatePath("/admin/products");
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
