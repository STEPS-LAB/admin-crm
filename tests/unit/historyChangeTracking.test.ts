import { describe, expect, it } from "vitest";

import {
  collectChangedFields,
  diffHistorySnapshots,
  pickChangedFields,
} from "@/lib/history/changeTracking";
import {
  productDetailToHistorySnapshot,
  productFormToHistorySnapshot,
} from "@/lib/history/snapshots";
import { resolvePublishOperation } from "@/services/historyService";

import type { ProductDetail } from "@/types/products";

describe("diffHistorySnapshots", () => {
  it("returns only changed fields", () => {
    const diff = diffHistorySnapshots(
      { price: "100", status: "draft" },
      { price: "120", status: "draft" },
    );

    expect(diff).toEqual({
      beforeData: { price: "100" },
      afterData: { price: "120" },
      changedFields: ["price"],
    });
  });

  it("returns null when snapshots are equal", () => {
    expect(diffHistorySnapshots({ price: "100" }, { price: "100" })).toBeNull();
  });
});

describe("collectChangedFields", () => {
  it("detects nested translation changes", () => {
    const changed = collectChangedFields(
      { translations: { uk: { name: "Old" } } },
      { translations: { uk: { name: "New" } } },
    );

    expect(changed).toEqual(["translations"]);
  });
});

describe("pickChangedFields", () => {
  it("picks only requested keys", () => {
    expect(pickChangedFields({ a: 1, b: 2, c: 3 }, ["a", "c"])).toEqual({ a: 1, c: 3 });
  });
});

describe("product history snapshots", () => {
  it("normalizes product detail into comparable snapshot", () => {
    const detail: ProductDetail = {
      id: "product-1",
      sku: "SKU-1",
      barcode: null,
      categoryId: "cat-1",
      brandId: null,
      status: "draft",
      price: "100.00",
      oldPrice: null,
      currency: "UAH",
      stockQuantity: 5,
      stockStatus: "in_stock",
      publishedAt: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      translations: {
        uk: {
          name: "Товар",
          slug: "tovar",
          shortDescription: null,
          description: "Опис",
        },
        en: {
          name: "Product",
          slug: "product",
          shortDescription: null,
          description: "Description",
        },
      },
      categoryName: "Category",
      brandName: null,
    };

    const snapshot = productDetailToHistorySnapshot(detail);

    expect(snapshot).not.toHaveProperty("id");
    expect(snapshot).not.toHaveProperty("createdAt");
    expect(snapshot.sku).toBe("SKU-1");
    expect(snapshot.translations).toEqual(detail.translations);
  });

  it("matches form and detail snapshots for equivalent data", () => {
    const form = {
      sku: "SKU-1",
      barcode: null,
      categoryId: "cat-1",
      brandId: null,
      status: "draft" as const,
      price: "100.00",
      oldPrice: null,
      currency: "UAH",
      stockQuantity: 5,
      stockStatus: "in_stock" as const,
      translations: {
        uk: {
          name: "Товар",
          slug: "tovar",
          shortDescription: null,
          description: "Опис",
        },
        en: {
          name: "Product",
          slug: "product",
          shortDescription: null,
          description: "Description",
        },
      },
    };

    expect(productFormToHistorySnapshot(form)).toEqual(productFormToHistorySnapshot(form));
  });
});

describe("resolvePublishOperation", () => {
  it("maps publish transitions", () => {
    expect(resolvePublishOperation("draft", "published")).toBe("publish");
    expect(resolvePublishOperation("published", "draft")).toBe("unpublish");
    expect(resolvePublishOperation("draft", "archived")).toBeNull();
  });
});
