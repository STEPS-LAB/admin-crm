"use server";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { toggleFeatureFlagSchema } from "@/schemas/feature-flags/featureFlagSchemas";
import { toggleFeatureFlag } from "@/services/featureFlagService";

import type { ServerActionResult } from "@/types";
import type { ToggleFeatureFlagResult } from "@/types/feature-flags";

export async function toggleFeatureFlagAction(
  slug: string,
  enabled: boolean,
): Promise<ServerActionResult<ToggleFeatureFlagResult>> {
  const parsed = toggleFeatureFlagSchema.safeParse({ slug, enabled });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await toggleFeatureFlag(parsed.data.slug, parsed.data.enabled, context);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update feature flag",
      code: "TOGGLE_FAILED",
    };
  }
}
