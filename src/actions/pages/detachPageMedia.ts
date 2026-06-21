"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { detachPageMedia } from "@/services/pageMediaService";
import { detachPageMediaSchema } from "@/schemas/media/entityMediaSchemas";

import type { ServerActionResult } from "@/types";

export async function detachPageMediaAction(
  pageId: string,
  usageId: string,
): Promise<ServerActionResult<{ usageId: string }>> {
  const parsed = detachPageMediaSchema.safeParse({ pageId, usageId });

  if (!parsed.success) {
    return { success: false, error: "Invalid input", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await detachPageMedia(parsed.data.pageId, parsed.data.usageId, context);
    revalidatePath(`/admin/pages/${parsed.data.pageId}`);
    revalidatePath("/admin/pages");
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
