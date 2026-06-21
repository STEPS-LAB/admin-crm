import { describe, expect, it } from "vitest";

import { API_SCOPES } from "@/constants/api";
import { createApiKeySchema } from "@/schemas/api/apiSchemas";

describe("createApiKeySchema", () => {
  it("accepts valid API key input", () => {
    const result = createApiKeySchema.safeParse({
      name: "Production storefront",
      scopes: ["read:products", "read:categories"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty scopes", () => {
    const result = createApiKeySchema.safeParse({
      name: "Production storefront",
      scopes: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects unknown scopes", () => {
    const result = createApiKeySchema.safeParse({
      name: "Production storefront",
      scopes: ["read:everything"],
    });

    expect(result.success).toBe(false);
  });

  it("accepts all supported scopes", () => {
    const result = createApiKeySchema.safeParse({
      name: "Full access",
      scopes: [...API_SCOPES],
    });

    expect(result.success).toBe(true);
  });
});
