"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { changeProductStatus, deleteProduct, duplicateProduct } from "@/services/productService";
import { productIdSchema, productStatusUpdateSchema } from "@/schemas/products/productSchemas";

import type { ServerActionResult } from "@/types";

export async function updateProductStatusAction(
  input: { id: string; status: string },
): Promise<ServerActionResult<{ id: string }>> {
  const parsed = productStatusUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid status update", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await changeProductStatus(parsed.data.id, parsed.data.status, context);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${parsed.data.id}`);
    return { success: true, data: { id: parsed.data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
      code: "STATUS_UPDATE_FAILED",
    };
  }
}

export async function deleteProductAction(id: string): Promise<ServerActionResult<{ id: string }>> {
  const parsed = productIdSchema.safeParse({ id });

  if (!parsed.success) {
    return { success: false, error: "Invalid product id", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await deleteProduct(parsed.data.id, context);
    revalidatePath("/admin/products");
    revalidatePath("/admin/catalog/trash");
    return { success: true, data: { id: parsed.data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete product",
      code: "DELETE_FAILED",
    };
  }
}

export async function duplicateProductAction(id: string): Promise<ServerActionResult<{ id: string }>> {
  const parsed = productIdSchema.safeParse({ id });

  if (!parsed.success) {
    return { success: false, error: "Invalid product id", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await duplicateProduct(parsed.data.id, context);
    revalidatePath("/admin/products");
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to duplicate product",
      code: "DUPLICATE_FAILED",
    };
  }
}
