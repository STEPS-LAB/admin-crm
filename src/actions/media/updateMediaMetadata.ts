"use server";

import { revalidatePath } from "next/cache";

import { updateMediaMetadata } from "@/services/mediaService";
import { mediaIdSchema, mediaMetadataSchema } from "@/schemas/media/mediaSchemas";

import type { ServerActionResult } from "@/types";
import type { MediaMutationResult } from "@/services/mediaService";

export async function updateMediaMetadataAction(
  _prevState: ServerActionResult<MediaMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<MediaMutationResult>> {
  const idParsed = mediaIdSchema.safeParse({ id: formData.get("id") });

  if (!idParsed.success) {
    return { success: false, error: "Invalid media id", code: "VALIDATION_ERROR" };
  }

  const parsed = mediaMetadataSchema.safeParse({
    altUk: formData.get("altUk"),
    altEn: formData.get("altEn"),
    titleUk: formData.get("titleUk"),
    titleEn: formData.get("titleEn"),
    captionUk: formData.get("captionUk"),
    captionEn: formData.get("captionEn"),
    copyright: formData.get("copyright"),
    photographer: formData.get("photographer"),
    license: formData.get("license"),
    isPublic: formData.get("isPublic") === "true",
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const result = await updateMediaMetadata(idParsed.data.id, parsed.data);
    revalidatePath("/admin/media");
    revalidatePath(`/admin/media/${idParsed.data.id}`);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update metadata",
      code: "UPDATE_FAILED",
    };
  }
}
