"use server";

import { revalidatePath } from "next/cache";

import { buildSettingsUpdateContext } from "@/actions/settings/buildSettingsUpdateContext";
import { updateSeoSettings } from "@/services/settingsService";
import { seoSettingsSchema } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export async function updateSeoSettingsAction(
  _prevState: ServerActionResult<SettingsMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<SettingsMutationResult>> {
  const parsed = seoSettingsSchema.safeParse({
    defaultMetaTitle: formData.get("defaultMetaTitle"),
    defaultMetaDescription: formData.get("defaultMetaDescription"),
    defaultOgImage: formData.get("defaultOgImage"),
    defaultTwitterCard: formData.get("defaultTwitterCard"),
    defaultIndexing: formData.get("defaultIndexing") === "true",
    defaultFollow: formData.get("defaultFollow") === "true",
    defaultRobots: formData.get("defaultRobots"),
    sitemapEnabled: formData.get("sitemapEnabled") === "true",
    sitemapAutoGenerate: formData.get("sitemapAutoGenerate") === "true",
    sitemapUpdateFrequency: formData.get("sitemapUpdateFrequency"),
    sitemapIncludeImages: formData.get("sitemapIncludeImages") === "true",
    sitemapIncludeVideos: formData.get("sitemapIncludeVideos") === "true",
    robotsEnabled: formData.get("robotsEnabled") === "true",
    robotsContent: formData.get("robotsContent"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildSettingsUpdateContext();
    const result = await updateSeoSettings(parsed.data, context);
    revalidatePath("/admin/settings/seo");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update SEO settings",
      code: "UPDATE_FAILED",
    };
  }
}
