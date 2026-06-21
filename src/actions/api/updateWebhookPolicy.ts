"use server";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { webhookPolicySettingsSchema } from "@/schemas/settings/settingsSchemas";
import { updateWebhookPolicySettings } from "@/services/settingsService";

import type { ServerActionResult } from "@/types";

export async function updateWebhookPolicyAction(
  _prevState: ServerActionResult<{ readonly id: string }> | null,
  formData: FormData,
): Promise<ServerActionResult<{ readonly id: string }>> {
  const parsed = webhookPolicySettingsSchema.safeParse({
    webhookMaxRetries: formData.get("webhookMaxRetries"),
    webhookRetryBaseDelaySeconds: formData.get("webhookRetryBaseDelaySeconds"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await updateWebhookPolicySettings(parsed.data, context);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update webhook policy",
      code: "UPDATE_FAILED",
    };
  }
}
