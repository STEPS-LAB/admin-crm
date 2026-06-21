import { describe, expect, it } from "vitest";

import { redirectFormSchema } from "@/schemas/seo/seoSchemas";

describe("redirectFormSchema", () => {
  it("accepts valid redirect payload", () => {
    const result = redirectFormSchema.safeParse({
      source: "/old-path",
      destination: "/new-path",
      statusCode: "301",
      enabled: true,
    });

    expect(result.success).toBe(true);
  });

  it("accepts absolute URL destination", () => {
    const result = redirectFormSchema.safeParse({
      source: "/legacy",
      destination: "https://example.com/new",
      statusCode: "302",
      enabled: false,
    });

    expect(result.success).toBe(true);
  });

  it("rejects source without leading slash", () => {
    const result = redirectFormSchema.safeParse({
      source: "old-path",
      destination: "/new-path",
      statusCode: "301",
      enabled: true,
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid destination format", () => {
    const result = redirectFormSchema.safeParse({
      source: "/old-path",
      destination: "new-path",
      statusCode: "301",
      enabled: true,
    });

    expect(result.success).toBe(false);
  });
});
