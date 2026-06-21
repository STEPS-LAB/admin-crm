import { describe, expect, it } from "vitest";

import { categoryFormSchema } from "@/schemas/categories/categorySchemas";

describe("categoryFormSchema", () => {
  it("accepts valid category payload", () => {
    const result = categoryFormSchema.safeParse({
      parentId: null,
      sortOrder: 0,
      status: "draft",
      translations: {
        uk: { name: "Електроніка", slug: "elektronika", description: "Опис" },
        en: { name: "Electronics", slug: "electronics", description: "Description" },
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid slug", () => {
    const result = categoryFormSchema.safeParse({
      parentId: null,
      sortOrder: 0,
      status: "draft",
      translations: {
        uk: { name: "Test", slug: "Bad Slug", description: null },
        en: { name: "Test", slug: "valid-slug", description: null },
      },
    });

    expect(result.success).toBe(false);
  });
});
