"use server";

import { revalidatePath } from "next/cache";

import { replaceMediaFile } from "@/services/mediaService";
import { mediaUploadSchema } from "@/schemas/media/mediaSchemas";

import type { ServerActionResult } from "@/types";
import type { MediaMutationResult } from "@/services/mediaService";

export async function replaceMediaAction(
  id: string,
  formData: FormData,
): Promise<ServerActionResult<MediaMutationResult>> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { success: false, error: "No file provided", code: "VALIDATION_ERROR" };
  }

  const parsed = mediaUploadSchema.safeParse({
    mimeType: file.type,
    fileSize: file.size,
    originalFilename: file.name,
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid file";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await replaceMediaFile(id, {
      buffer,
      mimeType: parsed.data.mimeType,
      originalFilename: parsed.data.originalFilename,
      fileSize: parsed.data.fileSize,
    });

    revalidatePath("/admin/media");
    revalidatePath(`/admin/media/${id}`);

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Replace failed",
      code: "REPLACE_FAILED",
    };
  }
}
