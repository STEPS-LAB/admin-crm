"use server";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { revokeApiKey } from "@/services/apiService";
import { revokeApiKeySchema } from "@/schemas/api/apiSchemas";

import type { ServerActionResult } from "@/types";
import type { ApiKeyListItem } from "@/types/api";

export async function revokeApiKeyAction(
  apiKeyId: string,
): Promise<ServerActionResult<ApiKeyListItem>> {
  const parsed = revokeApiKeySchema.safeParse({ id: apiKeyId });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await revokeApiKey(parsed.data.id, context);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to revoke API key",
      code: "REVOKE_FAILED",
    };
  }
}
