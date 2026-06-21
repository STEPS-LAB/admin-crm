"use server";

import { updateCategory } from "@/services/categoryService";
import { buildMutationContext } from "@/actions/buildMutationContext";
import { categoryFormSchema, categoryIdSchema } from "@/schemas/categories/categorySchemas";

import type { ServerActionResult } from "@/types";
import type { CategoryMutationResult } from "@/services/categoryService";

function parseCategoryForm(formData: FormData) {
  const parentId = formData.get("parentId");

  return categoryFormSchema.safeParse({
    parentId: parentId && parentId !== "none" ? parentId : null,
    sortOrder: formData.get("sortOrder"),
    status: formData.get("status"),
    translations: {
      uk: {
        name: formData.get("translations.uk.name"),
        slug: formData.get("translations.uk.slug"),
        description: formData.get("translations.uk.description") || null,
      },
      en: {
        name: formData.get("translations.en.name"),
        slug: formData.get("translations.en.slug"),
        description: formData.get("translations.en.description") || null,
      },
    },
  });
}

export async function updateCategoryAction(
  _prevState: ServerActionResult<CategoryMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<CategoryMutationResult>> {
  const idParsed = categoryIdSchema.safeParse({ id: formData.get("id") });

  if (!idParsed.success) {
    return { success: false, error: "Invalid category id", code: "VALIDATION_ERROR" };
  }

  const parsed = parseCategoryForm(formData);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await updateCategory(idParsed.data.id, parsed.data, context);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update category",
      code: "UPDATE_FAILED",
    };
  }
}
