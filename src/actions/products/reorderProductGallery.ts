"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { reorderProductGallery } from "@/services/productMediaService";
import { reorderProductGallerySchema } from "@/schemas/products/productMediaSchemas";

import type { ServerActionResult } from "@/types";

export async function reorderProductGalleryAction(
  productId: string,
  usageIds: string[],
): Promise<ServerActionResult<{ productId: string }>> {
  const parsed = reorderProductGallerySchema.safeParse({ productId, usageIds });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await reorderProductGallery(parsed.data.productId, parsed.data.usageIds, context);
    revalidatePath(`/admin/products/${parsed.data.productId}`);
    revalidatePath("/admin/products");
    return { success: true, data: { productId: parsed.data.productId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder gallery",
      code: "REORDER_FAILED",
    };
  }
}
