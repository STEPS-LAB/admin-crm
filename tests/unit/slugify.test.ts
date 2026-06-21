import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/utils/slug";

describe("slugify", () => {
  it("converts text to lowercase hyphenated slugs", () => {
    expect(slugify("Demo Product Name")).toBe("demo-product-name");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! World?")).toBe("hello-world");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  spaced value  ")).toBe("spaced-value");
  });
});
