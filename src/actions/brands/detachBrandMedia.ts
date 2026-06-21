"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { detachBrandMedia } from "@/services/brandMediaService";
import { detachBrandMediaSchema } from "@/schemas/media/entityMediaSchemas";

import type { ServerActionResult } from "@/types";

export async function detachBrandMediaAction(
  brandId: string,
  usageId: string,
): Promise<ServerActionResult<{ usageId: string }>> {
  const parsed = detachBrandMediaSchema.safeParse({ brandId, usageId });

  if (!parsed.success) {
    return { success: false, error: "Invalid input", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await detachBrandMedia(parsed.data.brandId, parsed.data.usageId, context);
    revalidatePath(`/admin/brands/${parsed.data.brandId}`);
    revalidatePath("/admin/brands");
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
