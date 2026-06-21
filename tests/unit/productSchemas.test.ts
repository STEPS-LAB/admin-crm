import { describe, expect, it } from "vitest";

import { productFormSchema } from "@/schemas/products/productSchemas";

describe("productFormSchema", () => {
  it("accepts valid product payload", () => {
    const result = productFormSchema.safeParse({
      sku: "SKU-001",
      barcode: null,
      categoryId: "00000000-0000-4000-8000-000000000010",
      brandId: null,
      status: "draft",
      price: "1999.00",
      oldPrice: null,
      currency: "UAH",
      stockQuantity: 10,
      stockStatus: "in_stock",
      translations: {
        uk: {
          name: "Демо",
          slug: "demo",
          shortDescription: "Короткий опис",
          description: "Повний опис",
        },
        en: {
          name: "Demo",
          slug: "demo-en",
          shortDescription: "Short",
          description: "Full",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid slug format", () => {
    const result = productFormSchema.safeParse({
      sku: "SKU-001",
      barcode: null,
      categoryId: "00000000-0000-4000-8000-000000000010",
      brandId: null,
      status: "draft",
      price: "10",
      oldPrice: null,
      currency: "UAH",
      stockQuantity: 0,
      stockStatus: "in_stock",
      translations: {
        uk: { name: "Test", slug: "Invalid Slug", shortDescription: null, description: null },
        en: { name: "Test", slug: "valid-slug", shortDescription: null, description: null },
      },
    });

    expect(result.success).toBe(false);
  });
});
