"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { changePageStatus, deletePage } from "@/services/pageService";
import { pageIdSchema, pageStatusUpdateSchema } from "@/schemas/pages/pageSchemas";

import type { ServerActionResult } from "@/types";

export async function updatePageStatusAction(input: {
  id: string;
  status: string;
}): Promise<ServerActionResult<{ id: string }>> {
  const parsed = pageStatusUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid status update", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await changePageStatus(parsed.data.id, parsed.data.status, context);
    revalidatePath("/admin/pages");
    revalidatePath(`/admin/pages/${parsed.data.id}`);
    return { success: true, data: { id: parsed.data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
      code: "STATUS_UPDATE_FAILED",
    };
  }
}

export async function deletePageAction(id: string): Promise<ServerActionResult<{ id: string }>> {
  const parsed = pageIdSchema.safeParse({ id });

  if (!parsed.success) {
    return { success: false, error: "Invalid page id", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await deletePage(parsed.data.id, context);
    revalidatePath("/admin/pages");
    return { success: true, data: { id: parsed.data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete page",
      code: "DELETE_FAILED",
    };
  }
}
