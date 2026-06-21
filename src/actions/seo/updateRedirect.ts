"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { updateRedirect } from "@/services/redirectService";
import { redirectFormSchema, redirectIdSchema } from "@/schemas/seo/seoSchemas";

import type { ServerActionResult } from "@/types";
import type { RedirectMutationResult } from "@/services/redirectService";

export async function updateRedirectAction(
  _prevState: ServerActionResult<RedirectMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<RedirectMutationResult>> {
  const idParsed = redirectIdSchema.safeParse({ id: formData.get("id") });

  if (!idParsed.success) {
    return { success: false, error: "Invalid redirect id", code: "VALIDATION_ERROR" };
  }

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
    const result = await updateRedirect(idParsed.data.id, parsed.data, context);
    revalidatePath("/admin/seo");
    revalidatePath("/admin/seo/redirects");
    revalidatePath(`/admin/seo/redirects/${idParsed.data.id}`);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update redirect",
      code: "UPDATE_FAILED",
    };
  }
}
