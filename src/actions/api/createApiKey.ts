"use server";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { createApiKey } from "@/services/apiService";
import { createApiKeySchema } from "@/schemas/api/apiSchemas";

import type { ServerActionResult } from "@/types";
import type { CreateApiKeyResult } from "@/types/api";

function parseCreateApiKeyForm(formData: FormData) {
  const scopes = formData.getAll("scopes").map((value) => String(value));
  const expiresAtRaw = formData.get("expiresAt");

  return createApiKeySchema.safeParse({
    name: formData.get("name"),
    scopes,
    expiresAt:
      typeof expiresAtRaw === "string" && expiresAtRaw.length > 0 ? expiresAtRaw : undefined,
  });
}

export async function createApiKeyAction(
  _prevState: ServerActionResult<CreateApiKeyResult> | null,
  formData: FormData,
): Promise<ServerActionResult<CreateApiKeyResult>> {
  const parsed = parseCreateApiKeyForm(formData);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await createApiKey(
      {
        name: parsed.data.name,
        scopes: parsed.data.scopes,
        expiresAt: parsed.data.expiresAt ?? null,
      },
      context,
    );
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create API key",
      code: "CREATE_FAILED",
    };
  }
}
