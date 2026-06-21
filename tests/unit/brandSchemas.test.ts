import { describe, expect, it } from "vitest";

import { brandFormSchema } from "@/schemas/brands/brandSchemas";

describe("brandFormSchema", () => {
  it("accepts valid brand payload", () => {
    const result = brandFormSchema.safeParse({
      slug: "demo-brand",
      logoUrl: "https://example.com/logo.png",
      website: "https://example.com",
      country: "Ukraine",
      status: "draft",
      translations: {
        uk: { name: "Демо бренд", description: "Опис бренду" },
        en: { name: "Demo brand", description: "Brand description" },
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid slug format", () => {
    const result = brandFormSchema.safeParse({
      slug: "Invalid Slug",
      logoUrl: null,
      website: null,
      country: null,
      status: "draft",
      translations: {
        uk: { name: "Test", description: null },
        en: { name: "Test", description: null },
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid website URL", () => {
    const result = brandFormSchema.safeParse({
      slug: "valid-slug",
      logoUrl: null,
      website: "not-a-url",
      country: null,
      status: "draft",
      translations: {
        uk: { name: "Test", description: null },
        en: { name: "Test", description: null },
      },
    });

    expect(result.success).toBe(false);
  });
});
