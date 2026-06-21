import { describe, expect, it } from "vitest";

import { buildBreadcrumbListJsonLd } from "@/lib/seo/breadcrumbJsonLd";
import {
  buildCategoryBreadcrumbTrail,
  buildProductBreadcrumbTrail,
} from "@/lib/public-site/breadcrumbTrails";

import type { PublicSiteProductDetail } from "@/types/public-site";

function buildProduct(overrides: Partial<PublicSiteProductDetail> = {}): PublicSiteProductDetail {
  return {
    id: "product-id",
    name: "Demo Product",
    slug: "demo-product",
    shortDescription: "Short",
    price: "100",
    currency: "UAH",
    categoryName: "Phones",
    brandName: "Acme",
    seoScore: 80,
    coverThumbnailUrl: null,
    coverAlt: null,
    description: null,
    oldPrice: null,
    stockStatus: "in_stock",
    sku: "SKU-1",
    categorySlug: "phones",
    brandSlug: "acme",
    seo: null,
    ...overrides,
  };
}

describe("buildProductBreadcrumbTrail", () => {
  it("includes parent category when available", () => {
    const trail = buildProductBreadcrumbTrail(buildProduct(), "uk");

    expect(trail).toHaveLength(3);
    expect(trail[0]?.label).toBe("Товари");
    expect(trail[1]?.label).toBe("Phones");
    expect(trail[2]?.label).toBe("Demo Product");
  });

  it("omits category when slug is missing", () => {
    const trail = buildProductBreadcrumbTrail(
      buildProduct({ categorySlug: null, categoryName: null }),
      "en",
    );

    expect(trail).toHaveLength(2);
    expect(trail[0]?.label).toBe("Products");
  });
});

describe("buildCategoryBreadcrumbTrail", () => {
  it("ends with the current category", () => {
    const trail = buildCategoryBreadcrumbTrail(
      {
        id: "category-id",
        name: "Phones",
        slug: "phones",
        description: null,
        productCount: 2,
        seoScore: null,
        coverThumbnailUrl: null,
        coverAlt: null,
        seo: null,
      },
      "uk",
    );

    expect(trail.at(-1)?.label).toBe("Phones");
    expect(trail.at(-1)?.href).toBeUndefined();
  });
});

describe("buildBreadcrumbListJsonLd", () => {
  it("builds absolute breadcrumb positions with home and current page", () => {
    const document = buildBreadcrumbListJsonLd({
      siteUrl: "https://example.com",
      language: "uk",
      items: buildProductBreadcrumbTrail(buildProduct(), "uk"),
      currentPageUrl: "https://example.com/uk/products/demo-product",
    });

    expect(document["@type"]).toBe("BreadcrumbList");

    const elements = document.itemListElement as Array<Record<string, unknown>>;

    expect(elements).toHaveLength(4);
    expect(elements[0]).toMatchObject({
      position: 1,
      name: "Головна",
      item: "https://example.com/uk",
    });
    expect(elements[3]).toMatchObject({
      position: 4,
      name: "Demo Product",
      item: "https://example.com/uk/products/demo-product",
    });
  });
});
