"use server";

import { revalidatePath } from "next/cache";

import { deleteMedia } from "@/services/mediaService";
import { mediaIdSchema } from "@/schemas/media/mediaSchemas";

import type { ServerActionResult } from "@/types";

export async function deleteMediaAction(id: string): Promise<ServerActionResult<{ id: string }>> {
  const parsed = mediaIdSchema.safeParse({ id });

  if (!parsed.success) {
    return { success: false, error: "Invalid media id", code: "VALIDATION_ERROR" };
  }

  try {
    await deleteMedia(parsed.data.id);
    revalidatePath("/admin/media");
    return { success: true, data: { id: parsed.data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete media",
      code: "DELETE_FAILED",
    };
  }
}
