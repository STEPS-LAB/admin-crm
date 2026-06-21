import { describe, expect, it } from "vitest";

import { API_KEY_PREFIX } from "@/constants/api";
import { extractBearerApiKey, hasApiScope, hashBearerApiKey } from "@/lib/api/publicApiAuth";
import { hashApiKey } from "@/lib/api/apiKeys";
import {
  publicApiDetailQuerySchema,
  publicApiListQuerySchema,
  publicApiSearchQuerySchema,
  publicApiSeoProfilesQuerySchema,
  publicApiSitemapQuerySchema,
} from "@/schemas/api/publicApiSchemas";

describe("extractBearerApiKey", () => {
  it("extracts a valid bearer token", () => {
    const token = `${API_KEY_PREFIX}abc123`;
    const request = new Request("https://example.com/api/v1/products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(extractBearerApiKey(request)).toBe(token);
  });

  it("rejects missing authorization", () => {
    const request = new Request("https://example.com/api/v1/products");
    expect(extractBearerApiKey(request)).toBeNull();
  });
});

describe("hasApiScope", () => {
  it("checks scope membership", () => {
    expect(hasApiScope(["read:products", "read:pages"], "read:products")).toBe(true);
    expect(hasApiScope(["read:products"], "read:brands")).toBe(false);
  });
});

describe("hashBearerApiKey", () => {
  it("matches stored hash helper", () => {
    const token = `${API_KEY_PREFIX}test-key`;
    expect(hashBearerApiKey(token)).toBe(hashApiKey(token));
  });
});

describe("publicApiListQuerySchema", () => {
  it("applies defaults", () => {
    const result = publicApiListQuerySchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.lang).toBe("uk");
    }
  });

  it("rejects oversized page limits", () => {
    const result = publicApiListQuerySchema.safeParse({ limit: 500 });
    expect(result.success).toBe(false);
  });
});

describe("publicApiDetailQuerySchema", () => {
  it("defaults language to uk", () => {
    const result = publicApiDetailQuerySchema.safeParse({});
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.lang).toBe("uk");
    }
  });
});

describe("publicApiSearchQuerySchema", () => {
  it("requires a search term", () => {
    const result = publicApiSearchQuerySchema.safeParse({ lang: "en" });
    expect(result.success).toBe(false);
  });

  it("applies per-type defaults", () => {
    const result = publicApiSearchQuerySchema.safeParse({ q: "chair" });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.lang).toBe("uk");
      expect(result.data.limit).toBe(5);
    }
  });
});

describe("publicApiSitemapQuerySchema", () => {
  it("defaults indexedOnly to true", () => {
    const result = publicApiSitemapQuerySchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.indexedOnly).toBe(true);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(100);
    }
  });

  it("parses indexedOnly=false", () => {
    const result = publicApiSitemapQuerySchema.safeParse({ indexedOnly: "false" });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.indexedOnly).toBe(false);
    }
  });
});

describe("publicApiSeoProfilesQuerySchema", () => {
  it("accepts optional owner type filter", () => {
    const result = publicApiSeoProfilesQuerySchema.safeParse({
      ownerType: "product",
      search: "sofa",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.ownerType).toBe("product");
      expect(result.data.search).toBe("sofa");
    }
  });
});
