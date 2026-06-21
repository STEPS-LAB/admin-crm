"use server";

import { createBrand } from "@/services/brandService";
import { buildMutationContext } from "@/actions/buildMutationContext";
import { sanitizeBrandFormRichText } from "@/lib/security/sanitizeFormRichText";
import { brandFormSchema } from "@/schemas/brands/brandSchemas";

import type { ServerActionResult } from "@/types";
import type { BrandMutationResult } from "@/services/brandService";

function parseBrandForm(formData: FormData) {
  return brandFormSchema.safeParse({
    slug: formData.get("slug"),
    logoUrl: formData.get("logoUrl") || null,
    website: formData.get("website") || null,
    country: formData.get("country") || null,
    status: formData.get("status"),
    translations: {
      uk: {
        name: formData.get("translations.uk.name"),
        description: formData.get("translations.uk.description") || null,
      },
      en: {
        name: formData.get("translations.en.name"),
        description: formData.get("translations.en.description") || null,
      },
    },
  });
}

export async function createBrandAction(
  _prevState: ServerActionResult<BrandMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<BrandMutationResult>> {
  const parsed = parseBrandForm(formData);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await createBrand(sanitizeBrandFormRichText(parsed.data), context);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create brand",
      code: "CREATE_FAILED",
    };
  }
}
