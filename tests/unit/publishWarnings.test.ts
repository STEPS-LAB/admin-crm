import { describe, expect, it } from "vitest";

import {
  collectCategoryPublishWarnings,
  collectProductPublishWarnings,
} from "@/lib/catalog/publishWarnings";

import type { EntityMediaCollection } from "@/types/entity-media";

const productInput = {
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
      shortDescription: null,
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

const emptyMedia: EntityMediaCollection = {
  cover: null,
  gallery: [],
};

describe("collectProductPublishWarnings", () => {
  it("returns no warnings for draft status", () => {
    expect(
      collectProductPublishWarnings(
        { ...productInput, status: "draft" },
        { media: emptyMedia, seoScore: 80 },
      ),
    ).toEqual([]);
  });

  it("warns about missing cover and short descriptions", () => {
    const warnings = collectProductPublishWarnings(productInput, {
      media: emptyMedia,
      seoScore: 80,
    });

    expect(warnings.some((warning) => warning.id === "cover-missing")).toBe(true);
    expect(warnings.some((warning) => warning.id === "short-description-uk")).toBe(true);
  });

  it("warns about low SEO score", () => {
    const warnings = collectProductPublishWarnings(
      {
        ...productInput,
        translations: {
          ...productInput.translations,
          uk: { ...productInput.translations.uk, shortDescription: "Short" },
        },
      },
      { media: emptyMedia, seoScore: 42 },
    );

    expect(warnings.some((warning) => warning.id === "seo-score-low")).toBe(true);
  });
});

describe("collectCategoryPublishWarnings", () => {
  it("warns about missing cover and descriptions", () => {
    const warnings = collectCategoryPublishWarnings(
      {
        parentId: null,
        sortOrder: 0,
        status: "published",
        translations: {
          uk: { name: "Категорія", slug: "kat", description: null },
          en: { name: "Category", slug: "cat", description: "Description" },
        },
      },
      { media: emptyMedia, seoScore: null },
    );

    expect(warnings.some((warning) => warning.id === "cover-missing")).toBe(true);
    expect(warnings.some((warning) => warning.id === "description-uk")).toBe(true);
    expect(warnings.some((warning) => warning.id === "seo-score-missing")).toBe(true);
  });
});
