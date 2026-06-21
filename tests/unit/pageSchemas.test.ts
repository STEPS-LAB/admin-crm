import { describe, expect, it } from "vitest";

import { pageFormSchema } from "@/schemas/pages/pageSchemas";

describe("pageFormSchema", () => {
  it("accepts valid page payload", () => {
    const result = pageFormSchema.safeParse({
      pageType: "static",
      status: "draft",
      isHomepage: false,
      sortOrder: 0,
      translations: {
        uk: {
          title: "Про нас",
          slug: "pro-nas",
          content: "Контент сторінки",
          excerpt: "Короткий опис",
        },
        en: {
          title: "About us",
          slug: "about-us",
          content: "Page content",
          excerpt: "Short excerpt",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid slug format", () => {
    const result = pageFormSchema.safeParse({
      pageType: "static",
      status: "draft",
      isHomepage: false,
      sortOrder: 0,
      translations: {
        uk: { title: "Test", slug: "Invalid Slug", content: null, excerpt: null },
        en: { title: "Test", slug: "valid-slug", content: null, excerpt: null },
      },
    });

    expect(result.success).toBe(false);
  });
});
