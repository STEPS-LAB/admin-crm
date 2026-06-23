"use server";

import { revalidatePath } from "next/cache";

import { getAuthenticatedUser } from "@/lib/auth/cachedAuthenticatedUser";
import { uploadMedia } from "@/services/mediaService";
import {
  enforceServerActionRateLimit,
  ServerActionRateLimitedError,
} from "@/lib/security/serverActionRateLimit";
import { mediaUploadSchema } from "@/schemas/media/mediaSchemas";

import type { ServerActionResult } from "@/types";
import type { MediaMutationResult } from "@/services/mediaService";

export async function uploadMediaAction(
  _prevState: ServerActionResult<MediaMutationResult> | null,
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
    const user = await getAuthenticatedUser();

    try {
      await enforceServerActionRateLimit("upload", user?.id ?? null);
    } catch (error) {
      if (error instanceof ServerActionRateLimitedError) {
        return { success: false, error: error.message, code: "RATE_LIMITED" };
      }

      throw error;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadMedia({
      buffer,
      mimeType: parsed.data.mimeType,
      originalFilename: parsed.data.originalFilename,
      fileSize: parsed.data.fileSize,
    });

    revalidatePath("/admin/media");

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
      code: "UPLOAD_FAILED",
    };
  }
}
