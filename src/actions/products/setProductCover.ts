"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { setProductCover } from "@/services/productMediaService";
import { setProductCoverSchema } from "@/schemas/products/productMediaSchemas";

import type { ServerActionResult } from "@/types";
import type { ProductMediaMutationResult } from "@/services/productMediaService";

export async function setProductCoverAction(
  productId: string,
  mediaAssetId: string,
): Promise<ServerActionResult<ProductMediaMutationResult>> {
  const parsed = setProductCoverSchema.safeParse({ productId, mediaAssetId });

  if (!parsed.success) {
    return { success: false, error: "Invalid input", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await setProductCover(parsed.data.productId, parsed.data.mediaAssetId, context);
    revalidatePath(`/admin/products/${parsed.data.productId}`);
    revalidatePath("/admin/products");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to set cover",
      code: "UPDATE_FAILED",
    };
  }
}
