"use server";

import { revalidatePath } from "next/cache";

import { updateSeoProfileMetadata } from "@/services/seoProfileService";
import { seoMetadataSchema, seoProfileIdSchema } from "@/schemas/seo/seoSchemas";

import type { ServerActionResult } from "@/types";
import type { SeoProfileMutationResult } from "@/services/seoProfileService";

export async function updateSeoProfileMetadataAction(
  _prevState: ServerActionResult<SeoProfileMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<SeoProfileMutationResult>> {
  const idParsed = seoProfileIdSchema.safeParse({ id: formData.get("id") });

  if (!idParsed.success) {
    return { success: false, error: "Invalid profile id", code: "VALIDATION_ERROR" };
  }

  const parsed = seoMetadataSchema.safeParse({
    metaTitle: formData.get("metaTitle") || null,
    metaDescription: formData.get("metaDescription") || null,
    index: formData.get("index") === "true",
    follow: formData.get("follow") === "true",
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const result = await updateSeoProfileMetadata(idParsed.data.id, parsed.data);
    revalidatePath("/admin/seo");
    revalidatePath("/admin/seo/profiles");
    revalidatePath(`/admin/seo/profiles/${idParsed.data.id}`);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update metadata",
      code: "UPDATE_FAILED",
    };
  }
}
