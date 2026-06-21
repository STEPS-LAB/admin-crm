"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { createRedirect } from "@/services/redirectService";
import { redirectFormSchema } from "@/schemas/seo/seoSchemas";

import type { ServerActionResult } from "@/types";
import type { RedirectMutationResult } from "@/services/redirectService";

export async function createRedirectAction(
  _prevState: ServerActionResult<RedirectMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<RedirectMutationResult>> {
  const parsed = redirectFormSchema.safeParse({
    source: formData.get("source"),
    destination: formData.get("destination"),
    statusCode: formData.get("statusCode"),
    enabled: formData.get("enabled") === "true",
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await createRedirect(parsed.data, context);
    revalidatePath("/admin/seo");
    revalidatePath("/admin/seo/redirects");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create redirect",
      code: "CREATE_FAILED",
    };
  }
}
