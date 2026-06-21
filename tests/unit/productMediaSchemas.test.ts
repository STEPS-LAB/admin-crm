import { describe, expect, it } from "vitest";

import {
  attachCategoryMediaSchema,
  attachProductMediaSchema,
  reorderProductGallerySchema,
} from "@/schemas/media/entityMediaSchemas";

const PRODUCT_ID = "00000000-0000-4000-8000-000000000020";
const MEDIA_ID = "00000000-0000-4000-8000-000000000099";
const USAGE_ID = "00000000-0000-4000-8000-000000000088";

describe("attachProductMediaSchema", () => {
  it("accepts gallery attachment", () => {
    const result = attachProductMediaSchema.safeParse({
      productId: PRODUCT_ID,
      mediaAssetId: MEDIA_ID,
      usageType: "gallery",
    });

    expect(result.success).toBe(true);
  });

  it("defaults usage type to gallery", () => {
    const result = attachProductMediaSchema.safeParse({
      productId: PRODUCT_ID,
      mediaAssetId: MEDIA_ID,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.usageType).toBe("gallery");
    }
  });
});

describe("attachCategoryMediaSchema", () => {
  it("accepts gallery attachment", () => {
    const result = attachCategoryMediaSchema.safeParse({
      categoryId: PRODUCT_ID,
      mediaAssetId: MEDIA_ID,
      usageType: "gallery",
    });

    expect(result.success).toBe(true);
  });
});

describe("reorderProductGallerySchema", () => {
  it("requires at least one usage id", () => {
    const result = reorderProductGallerySchema.safeParse({
      productId: PRODUCT_ID,
      usageIds: [],
    });

    expect(result.success).toBe(false);
  });

  it("accepts ordered usage ids", () => {
    const result = reorderProductGallerySchema.safeParse({
      productId: PRODUCT_ID,
      usageIds: [USAGE_ID],
    });

    expect(result.success).toBe(true);
  });
});
