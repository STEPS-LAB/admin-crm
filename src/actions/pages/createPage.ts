"use server";

import { createPage } from "@/services/pageService";
import { buildMutationContext } from "@/actions/buildMutationContext";
import { sanitizePageFormRichText } from "@/lib/security/sanitizeFormRichText";
import { pageFormSchema } from "@/schemas/pages/pageSchemas";

import type { ServerActionResult } from "@/types";
import type { PageMutationResult } from "@/services/pageService";

function parsePageForm(formData: FormData) {
  return pageFormSchema.safeParse({
    pageType: formData.get("pageType"),
    status: formData.get("status"),
    isHomepage: formData.get("isHomepage") === "true",
    sortOrder: formData.get("sortOrder"),
    translations: {
      uk: {
        title: formData.get("translations.uk.title"),
        slug: formData.get("translations.uk.slug"),
        content: formData.get("translations.uk.content") || null,
        excerpt: formData.get("translations.uk.excerpt") || null,
      },
      en: {
        title: formData.get("translations.en.title"),
        slug: formData.get("translations.en.slug"),
        content: formData.get("translations.en.content") || null,
        excerpt: formData.get("translations.en.excerpt") || null,
      },
    },
  });
}

export async function createPageAction(
  _prevState: ServerActionResult<PageMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<PageMutationResult>> {
  const parsed = parsePageForm(formData);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await createPage(sanitizePageFormRichText(parsed.data), context);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create page",
      code: "CREATE_FAILED",
    };
  }
}
