"use server";

import { revalidatePath } from "next/cache";

import { compressMedia } from "@/services/mediaService";

import type { ServerActionResult } from "@/types";
import type { MediaMutationResult } from "@/services/mediaService";

export async function compressMediaAction(id: string): Promise<ServerActionResult<MediaMutationResult>> {
  try {
    const result = await compressMedia(id);
    revalidatePath("/admin/media");
    revalidatePath(`/admin/media/${id}`);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Compression failed",
      code: "COMPRESS_FAILED",
    };
  }
}
