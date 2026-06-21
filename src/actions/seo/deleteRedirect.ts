"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { deleteRedirect } from "@/services/redirectService";
import { redirectIdSchema } from "@/schemas/seo/seoSchemas";

import type { ServerActionResult } from "@/types";

export async function deleteRedirectAction(id: string): Promise<ServerActionResult<{ id: string }>> {
  const parsed = redirectIdSchema.safeParse({ id });

  if (!parsed.success) {
    return { success: false, error: "Invalid redirect id", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await deleteRedirect(parsed.data.id, context);
    revalidatePath("/admin/seo");
    revalidatePath("/admin/seo/redirects");
    return { success: true, data: { id: parsed.data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete redirect",
      code: "DELETE_FAILED",
    };
  }
}
