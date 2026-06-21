"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { changeBrandStatus, deleteBrand } from "@/services/brandService";
import { brandIdSchema, brandStatusUpdateSchema } from "@/schemas/brands/brandSchemas";

import type { ServerActionResult } from "@/types";

export async function updateBrandStatusAction(input: {
  id: string;
  status: string;
}): Promise<ServerActionResult<{ id: string }>> {
  const parsed = brandStatusUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid status update", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await changeBrandStatus(parsed.data.id, parsed.data.status, context);
    revalidatePath("/admin/brands");
    revalidatePath(`/admin/brands/${parsed.data.id}`);
    return { success: true, data: { id: parsed.data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
      code: "STATUS_UPDATE_FAILED",
    };
  }
}

export async function deleteBrandAction(id: string): Promise<ServerActionResult<{ id: string }>> {
  const parsed = brandIdSchema.safeParse({ id });

  if (!parsed.success) {
    return { success: false, error: "Invalid brand id", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await deleteBrand(parsed.data.id, context);
    revalidatePath("/admin/brands");
    return { success: true, data: { id: parsed.data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete brand",
      code: "DELETE_FAILED",
    };
  }
}
