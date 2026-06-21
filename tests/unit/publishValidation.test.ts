import { describe, expect, it } from "vitest";

import {
  mergePublishValidationResults,
  validateBrandPublishInput,
  validateCategoryPublishInput,
  validateProductPublishInput,
} from "@/lib/catalog/publishValidation";

const validProductInput = {
  sku: "SKU-001",
  barcode: null,
  categoryId: "00000000-0000-4000-8000-000000000010",
  brandId: null,
  status: "published" as const,
  price: "1999.00",
  oldPrice: null,
  currency: "UAH",
  stockQuantity: 10,
  stockStatus: "in_stock" as const,
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
      description: "Full description",
    },
  },
};

const validCategoryInput = {
  parentId: null,
  sortOrder: 0,
  status: "published" as const,
  translations: {
    uk: {
      name: "Категорія",
      slug: "kategoriia",
      description: "Опис",
    },
    en: {
      name: "Category",
      slug: "category",
      description: "Description",
    },
  },
};

describe("validateProductPublishInput", () => {
  it("skips validation for draft products", () => {
    const result = validateProductPublishInput({
      ...validProductInput,
      status: "draft",
      translations: {
        uk: { ...validProductInput.translations.uk, description: null },
        en: { ...validProductInput.translations.en, description: null },
      },
    });

    expect(result.valid).toBe(true);
  });

  it("accepts a complete published product payload", () => {
    expect(validateProductPublishInput(validProductInput).valid).toBe(true);
  });

  it("requires both descriptions when publishing", () => {
    const result = validateProductPublishInput({
      ...validProductInput,
      translations: {
        ...validProductInput.translations,
        uk: { ...validProductInput.translations.uk, description: null },
      },
    });

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.field === "translations.uk.description")).toBe(true);
  });

  it("requires a positive price when publishing", () => {
    const result = validateProductPublishInput({
      ...validProductInput,
      price: "0",
    });

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.field === "price")).toBe(true);
  });
});

describe("validateCategoryPublishInput", () => {
  it("requires both names when publishing", () => {
    const result = validateCategoryPublishInput({
      ...validCategoryInput,
      translations: {
        ...validCategoryInput.translations,
        en: { ...validCategoryInput.translations.en, name: "" },
      },
    });

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.field === "translations.en.name")).toBe(true);
  });
});

const validBrandInput = {
  slug: "demo-brand",
  logoUrl: null,
  website: null,
  country: null,
  status: "published" as const,
  translations: {
    uk: { name: "Демо бренд", description: "Опис" },
    en: { name: "Demo brand", description: "Description" },
  },
};

describe("validateBrandPublishInput", () => {
  it("skips validation for draft brands", () => {
    const result = validateBrandPublishInput({
      ...validBrandInput,
      status: "draft",
      translations: {
        uk: { name: "", description: null },
        en: { name: "", description: null },
      },
    });

    expect(result.valid).toBe(true);
  });

  it("requires both names and slug when publishing", () => {
    const result = validateBrandPublishInput({
      ...validBrandInput,
      slug: "",
      translations: {
        ...validBrandInput.translations,
        en: { ...validBrandInput.translations.en, name: "" },
      },
    });

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.field === "translations.en.name")).toBe(true);
    expect(result.issues.some((issue) => issue.field === "slug")).toBe(true);
  });
});

describe("mergePublishValidationResults", () => {
  it("combines issues from multiple validators", () => {
    const merged = mergePublishValidationResults(
      { valid: false, issues: [{ field: "a", message: "A" }] },
      { valid: false, issues: [{ field: "b", message: "B" }] },
    );

    expect(merged.valid).toBe(false);
    expect(merged.issues).toHaveLength(2);
  });
});
