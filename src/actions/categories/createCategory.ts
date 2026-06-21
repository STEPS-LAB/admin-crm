"use server";

import { createCategory } from "@/services/categoryService";
import { buildMutationContext } from "@/actions/buildMutationContext";
import { categoryFormSchema } from "@/schemas/categories/categorySchemas";

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

export async function createCategoryAction(
  _prevState: ServerActionResult<CategoryMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<CategoryMutationResult>> {
  const parsed = parseCategoryForm(formData);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await createCategory(parsed.data, context);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create category",
      code: "CREATE_FAILED",
    };
  }
}
