"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { detachProductMedia } from "@/services/productMediaService";
import { detachProductMediaSchema } from "@/schemas/products/productMediaSchemas";

import type { ServerActionResult } from "@/types";

export async function detachProductMediaAction(
  productId: string,
  usageId: string,
): Promise<ServerActionResult<{ usageId: string }>> {
  const parsed = detachProductMediaSchema.safeParse({ productId, usageId });

  if (!parsed.success) {
    return { success: false, error: "Invalid input", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await detachProductMedia(parsed.data.productId, parsed.data.usageId, context);
    revalidatePath(`/admin/products/${parsed.data.productId}`);
    revalidatePath("/admin/products");
    revalidatePath("/admin/media");
    return { success: true, data: { usageId: parsed.data.usageId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to detach media",
      code: "DETACH_FAILED",
    };
  }
}
