"use server";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { togglePlugin } from "@/services/pluginService";
import { togglePluginSchema } from "@/schemas/plugins/pluginSchemas";

import type { ServerActionResult } from "@/types";
import type { TogglePluginResult } from "@/types/plugins";

export async function togglePluginAction(
  slug: string,
  enabled: boolean,
): Promise<ServerActionResult<TogglePluginResult>> {
  const parsed = togglePluginSchema.safeParse({ slug, enabled });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await togglePlugin(parsed.data.slug, parsed.data.enabled, context);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update plugin",
      code: "TOGGLE_FAILED",
    };
  }
}
