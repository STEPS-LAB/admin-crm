"use server";

import { createProduct } from "@/services/productService";
import { buildMutationContext } from "@/actions/buildMutationContext";
import { productFormSchema } from "@/schemas/products/productSchemas";

import type { ServerActionResult } from "@/types";
import type { ProductMutationResult } from "@/services/productService";

function parseProductForm(formData: FormData) {
  return productFormSchema.safeParse({
    sku: formData.get("sku"),
    barcode: formData.get("barcode") || null,
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId") || null,
    status: formData.get("status"),
    price: formData.get("price"),
    oldPrice: formData.get("oldPrice") || null,
    currency: formData.get("currency") || "UAH",
    stockQuantity: formData.get("stockQuantity"),
    stockStatus: formData.get("stockStatus"),
    translations: {
      uk: {
        name: formData.get("translations.uk.name"),
        slug: formData.get("translations.uk.slug"),
        shortDescription: formData.get("translations.uk.shortDescription") || null,
        description: formData.get("translations.uk.description") || null,
      },
      en: {
        name: formData.get("translations.en.name"),
        slug: formData.get("translations.en.slug"),
        shortDescription: formData.get("translations.en.shortDescription") || null,
        description: formData.get("translations.en.description") || null,
      },
    },
  });
}

export async function createProductAction(
  _prevState: ServerActionResult<ProductMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<ProductMutationResult>> {
  const parsed = parseProductForm(formData);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: firstError, code: "VALIDATION_ERROR" };
  }

  try {
    const context = await buildMutationContext();
    const result = await createProduct(parsed.data, context);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create product",
      code: "CREATE_FAILED",
    };
  }
}
