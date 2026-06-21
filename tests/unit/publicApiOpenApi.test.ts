import { describe, expect, it } from "vitest";

import { API_SCOPES, PREPARED_API_ENDPOINTS, PUBLIC_API_VERSION } from "@/constants/api";
import { buildPublicApiOpenApiDocument } from "@/lib/api/openapi/buildPublicApiOpenApiDocument";

describe("buildPublicApiOpenApiDocument", () => {
  const document = buildPublicApiOpenApiDocument({ siteUrl: "https://example.com/" });

  it("declares OpenAPI 3.1 metadata", () => {
    expect(document.openapi).toBe("3.1.0");
    expect(document.info.version).toBe(PUBLIC_API_VERSION);
    expect(document.servers[0]?.url).toBe("https://example.com");
  });

  it("documents every active REST endpoint except the spec itself", () => {
    const documentedPaths = Object.keys(document.paths);
    const activeEndpoints = PREPARED_API_ENDPOINTS.filter(
      (endpoint) => endpoint.status === "active" && !endpoint.path.endsWith("openapi.json"),
    );

    for (const endpoint of activeEndpoints) {
      const openApiPath = endpoint.path.replace(/\{([^}]+)\}/g, "{$1}");
      expect(documentedPaths).toContain(openApiPath);
    }
  });

  it("requires bearer auth for scoped routes", () => {
    const productOperation = document.paths["/api/v1/products"]?.get;
    expect(productOperation?.security).toEqual([{ bearerAuth: ["read:products"] }]);
    expect(document.paths["/api/v1/health"]?.get?.security).toBeUndefined();
  });

  it("lists all API scopes in the description", () => {
    for (const scope of API_SCOPES) {
      expect(document.info.description).toContain(scope);
    }
  });

  it("defines shared error and entity schemas", () => {
    expect(document.components.schemas.ApiError).toBeDefined();
    expect(document.components.schemas.ProductDetail).toBeDefined();
    expect(document.components.schemas.SearchResult).toBeDefined();
    expect(document.components.responses.Unauthorized).toBeDefined();
  });
});
