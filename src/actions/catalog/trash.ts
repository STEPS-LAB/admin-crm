"use server";

import { revalidatePath } from "next/cache";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { listCatalogTrash, restoreCatalogEntity } from "@/services/catalogTrashService";
import { restoreCatalogEntitySchema } from "@/schemas/catalog/catalogTrashSchemas";

import type { CatalogTrashListItem } from "@/types/catalog-trash";
import type { ServerActionResult } from "@/types";

export async function listCatalogTrashAction(): Promise<CatalogTrashListItem[]> {
  return listCatalogTrash();
}

export async function restoreCatalogEntityAction(
  input: unknown,
): Promise<ServerActionResult<{ readonly id: string }>> {
  const parsed = restoreCatalogEntitySchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid restore request", code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    await restoreCatalogEntity(parsed.data.entityType, parsed.data.id, context);
    revalidatePath("/admin/catalog/trash");
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/pages");
    revalidatePath("/admin/brands");
    return { success: true, data: { id: parsed.data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to restore item",
      code: "RESTORE_FAILED",
    };
  }
}
