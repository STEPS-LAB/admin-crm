import {
  API_KEY_PREFIX,
  API_SCOPE_LABELS,
  API_SCOPES,
  PUBLIC_API_VERSION,
  type ApiScope,
} from "@/constants/api";

import type {
  OpenApiDocument,
  OpenApiOperation,
  OpenApiParameter,
  OpenApiResponse,
  OpenApiSchema,
} from "@/types/openapi";

export interface BuildPublicApiOpenApiDocumentInput {
  readonly siteUrl: string;
}

function ref(name: string): OpenApiSchema {
  return { $ref: `#/components/schemas/${name}` };
}

function responseRef(name: string): OpenApiResponse {
  return { $ref: `#/components/responses/${name}` } as unknown as OpenApiResponse;
}

function paramRef(name: string): OpenApiParameter {
  return { $ref: `#/components/parameters/${name}` } as unknown as OpenApiParameter;
}

function langQueryParam(required = false): OpenApiParameter {
  return {
    name: "lang",
    in: "query",
    required,
    description: "Content language",
    schema: {
      type: "string",
      enum: ["uk", "en"],
      default: "uk",
    },
  };
}

function paginationQueryParams(): OpenApiParameter[] {
  return [
    {
      name: "page",
      in: "query",
      description: "Page number (1-based)",
      schema: { type: "integer", minimum: 1, default: 1 },
    },
    {
      name: "limit",
      in: "query",
      description: "Items per page",
      schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
    },
    langQueryParam(),
  ];
}

function scopedSecurity(scope: ApiScope): readonly Record<string, readonly string[]>[] {
  return [{ bearerAuth: [scope] }];
}

type RateLimitHeaders = Record<string, { readonly description: string; readonly schema: OpenApiSchema }>;

function rateLimitResponseHeaders(): RateLimitHeaders {
  return {
    "X-RateLimit-Limit": {
      description: "Maximum requests allowed per minute for this API key",
      schema: { type: "integer" },
    },
    "X-RateLimit-Remaining": {
      description: "Remaining requests in the current window",
      schema: { type: "integer" },
    },
    "X-RateLimit-Reset": {
      description: "Unix timestamp when the rate limit window resets",
      schema: { type: "integer" },
    },
  };
}

function successResponse(
  dataSchema: OpenApiSchema,
  description: string,
  withMeta = false,
): OpenApiResponse {
  const properties: Record<string, OpenApiSchema> = {
    success: { type: "boolean", enum: ["true"] },
    data: dataSchema,
  };

  if (withMeta) {
    properties.meta = ref("PaginationMeta");
  }

  return {
    description,
    headers: rateLimitResponseHeaders(),
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["success", "data"],
          properties,
        },
      },
    },
  };
}

function buildSchemas(): Record<string, OpenApiSchema> {
  return {
    ApiError: {
      type: "object",
      required: ["success", "error"],
      properties: {
        success: { type: "boolean", enum: ["false"] },
        error: {
          type: "object",
          required: ["code", "message"],
          properties: {
            code: {
              type: "string",
              enum: ["UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND", "VALIDATION_ERROR", "RATE_LIMITED", "INTERNAL_ERROR"],
            },
            message: { type: "string" },
          },
        },
      },
    },
    PaginationMeta: {
      type: "object",
      required: ["page", "limit", "total", "totalPages"],
      properties: {
        page: { type: "integer" },
        limit: { type: "integer" },
        total: { type: "integer" },
        totalPages: { type: "integer" },
        language: { type: "string", enum: ["uk", "en"] },
      },
    },
    ProductCard: {
      type: "object",
      required: ["id", "name", "slug", "price", "currency"],
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string" },
        slug: { type: "string" },
        shortDescription: { type: "string", nullable: true },
        price: { type: "string" },
        currency: { type: "string" },
        categoryName: { type: "string", nullable: true },
        brandName: { type: "string", nullable: true },
        seoScore: { type: "integer", nullable: true },
        coverThumbnailUrl: { type: "string", nullable: true },
        coverAlt: { type: "string", nullable: true },
      },
    },
    ProductDetail: {
      allOf: [
        ref("ProductCard"),
        {
          type: "object",
          properties: {
            description: { type: "string", nullable: true },
            oldPrice: { type: "string", nullable: true },
            stockStatus: { type: "string" },
            sku: { type: "string" },
            categorySlug: { type: "string", nullable: true },
            brandSlug: { type: "string", nullable: true },
            seo: ref("SeoMetadata"),
          },
        },
      ],
    },
    CategoryCard: {
      type: "object",
      required: ["id", "name", "slug", "productCount"],
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string" },
        slug: { type: "string" },
        description: { type: "string", nullable: true },
        productCount: { type: "integer" },
        seoScore: { type: "integer", nullable: true },
        coverThumbnailUrl: { type: "string", nullable: true },
        coverAlt: { type: "string", nullable: true },
      },
    },
    CategoryDetail: {
      allOf: [
        ref("CategoryCard"),
        {
          type: "object",
          properties: {
            seo: ref("SeoMetadata"),
          },
        },
      ],
    },
    PageDetail: {
      type: "object",
      required: ["id", "title", "slug", "pageType"],
      properties: {
        id: { type: "string", format: "uuid" },
        title: { type: "string" },
        slug: { type: "string" },
        excerpt: { type: "string", nullable: true },
        content: { type: "string", nullable: true },
        pageType: { type: "string" },
        seo: ref("SeoMetadata"),
      },
    },
    BrandDetail: {
      type: "object",
      required: ["id", "name", "slug"],
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string" },
        slug: { type: "string" },
        description: { type: "string", nullable: true },
        website: { type: "string", nullable: true },
        country: { type: "string", nullable: true },
        seo: ref("SeoMetadata"),
        coverThumbnailUrl: { type: "string", nullable: true },
        coverAlt: { type: "string", nullable: true },
      },
    },
    SeoMetadata: {
      type: "object",
      nullable: true,
      properties: {
        metaTitle: { type: "string", nullable: true },
        metaDescription: { type: "string", nullable: true },
        overallScore: { type: "integer", nullable: true },
      },
    },
    PublicSettings: {
      type: "object",
      required: [
        "siteName",
        "siteUrl",
        "defaultLanguage",
        "supportedLanguages",
        "timezone",
        "currency",
        "localizedUrlsEnabled",
      ],
      properties: {
        siteName: { type: "string" },
        siteDescription: { type: "string", nullable: true },
        siteUrl: { type: "string", format: "uri" },
        defaultLanguage: { type: "string", enum: ["uk", "en"] },
        supportedLanguages: {
          type: "array",
          items: { type: "string", enum: ["uk", "en"] },
        },
        timezone: { type: "string" },
        currency: { type: "string" },
        localizedUrlsEnabled: { type: "boolean" },
      },
    },
    HealthStatus: {
      type: "object",
      required: ["status", "version", "timestamp"],
      properties: {
        status: { type: "string", enum: ["ok"] },
        version: { type: "string" },
        timestamp: { type: "string", format: "date-time" },
      },
    },
    SearchResult: {
      type: "object",
      required: ["query", "products", "categories", "pages", "brands"],
      properties: {
        query: { type: "string" },
        products: { type: "array", items: ref("ProductCard") },
        categories: { type: "array", items: ref("CategoryCard") },
        pages: { type: "array", items: ref("SearchPageResult") },
        brands: { type: "array", items: ref("SearchBrandResult") },
      },
    },
    SearchPageResult: {
      type: "object",
      required: ["id", "title", "slug"],
      properties: {
        id: { type: "string", format: "uuid" },
        title: { type: "string" },
        slug: { type: "string" },
        excerpt: { type: "string", nullable: true },
      },
    },
    SearchBrandResult: {
      type: "object",
      required: ["id", "name", "slug"],
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string" },
        slug: { type: "string" },
      },
    },
    SitemapPayload: {
      type: "object",
      required: [
        "enabled",
        "autoGenerate",
        "siteUrl",
        "sitemapUrl",
        "totalUrls",
        "indexedUrls",
        "excludedUrls",
        "hiddenUrls",
        "typeStats",
        "entries",
        "generatedAt",
      ],
      properties: {
        enabled: { type: "boolean" },
        autoGenerate: { type: "boolean" },
        siteUrl: { type: "string", format: "uri" },
        sitemapUrl: { type: "string", format: "uri" },
        totalUrls: { type: "integer" },
        indexedUrls: { type: "integer" },
        excludedUrls: { type: "integer" },
        hiddenUrls: { type: "integer" },
        typeStats: { type: "array", items: ref("SitemapTypeStat") },
        entries: { type: "array", items: ref("SitemapEntry") },
        generatedAt: { type: "string", format: "date-time" },
      },
    },
    SitemapTypeStat: {
      type: "object",
      required: ["ownerType", "count"],
      properties: {
        ownerType: { type: "string", enum: ["product", "category", "page", "brand"] },
        count: { type: "integer" },
      },
    },
    SitemapEntry: {
      type: "object",
      required: [
        "ownerType",
        "ownerId",
        "language",
        "loc",
        "slug",
        "label",
        "lastmod",
        "changefreq",
        "priority",
        "indexed",
        "excluded",
      ],
      properties: {
        ownerType: { type: "string", enum: ["product", "category", "page", "brand"] },
        ownerId: { type: "string", format: "uuid" },
        language: { type: "string", enum: ["uk", "en"] },
        loc: { type: "string", format: "uri" },
        slug: { type: "string" },
        label: { type: "string" },
        lastmod: { type: "string", format: "date-time" },
        changefreq: { type: "string" },
        priority: { type: "string" },
        indexed: { type: "boolean" },
        excluded: { type: "boolean" },
      },
    },
    SeoProfileItem: {
      type: "object",
      required: [
        "id",
        "ownerType",
        "ownerId",
        "language",
        "entityLabel",
        "isIndexable",
        "updatedAt",
      ],
      properties: {
        id: { type: "string", format: "uuid" },
        ownerType: { type: "string", enum: ["product", "category", "page", "brand"] },
        ownerId: { type: "string", format: "uuid" },
        language: { type: "string", enum: ["uk", "en"] },
        entityLabel: { type: "string" },
        metaTitle: { type: "string", nullable: true },
        metaDescription: { type: "string", nullable: true },
        overallScore: { type: "integer", nullable: true },
        isIndexable: { type: "boolean" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    MediaAsset: {
      type: "object",
      required: [
        "id",
        "originalFilename",
        "mimeType",
        "extension",
        "fileSize",
        "publicUrl",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        id: { type: "string", format: "uuid" },
        originalFilename: { type: "string" },
        mimeType: { type: "string" },
        extension: { type: "string" },
        fileSize: { type: "integer" },
        width: { type: "integer", nullable: true },
        height: { type: "integer", nullable: true },
        altUk: { type: "string", nullable: true },
        altEn: { type: "string", nullable: true },
        titleUk: { type: "string", nullable: true },
        titleEn: { type: "string", nullable: true },
        captionUk: { type: "string", nullable: true },
        captionEn: { type: "string", nullable: true },
        copyright: { type: "string", nullable: true },
        photographer: { type: "string", nullable: true },
        license: { type: "string", nullable: true },
        publicUrl: { type: "string", format: "uri" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  };
}

function standardErrorResponses(): Record<string, OpenApiResponse> {
  const errorContent = {
    "application/json": {
      schema: ref("ApiError"),
    },
  };

  return {
    Unauthorized: {
      description: "Missing or invalid API key",
      content: errorContent,
    },
    Forbidden: {
      description: "API key does not include the required scope",
      content: errorContent,
    },
    NotFound: {
      description: "Resource not found",
      headers: rateLimitResponseHeaders(),
      content: errorContent,
    },
    ValidationError: {
      description: "Invalid query parameters",
      content: errorContent,
    },
    RateLimited: {
      description: "Rate limit exceeded",
      headers: rateLimitResponseHeaders(),
      content: errorContent,
    },
    InternalError: {
      description: "Unexpected server error",
      headers: rateLimitResponseHeaders(),
      content: errorContent,
    },
  };
}

function standardProtectedResponses(success: OpenApiResponse): OpenApiOperation["responses"] {
  return {
    "200": success,
    "400": responseRef("ValidationError"),
    "401": responseRef("Unauthorized"),
    "403": responseRef("Forbidden"),
    "429": responseRef("RateLimited"),
    "500": responseRef("InternalError"),
  };
}

export function buildPublicApiOpenApiDocument(
  input: BuildPublicApiOpenApiDocumentInput,
): OpenApiDocument {
  const serverUrl = input.siteUrl.replace(/\/+$/, "");
  const scopeDescriptions = API_SCOPES.map(
    (scope) => `- \`${scope}\` — ${API_SCOPE_LABELS[scope]}`,
  ).join("\n");

  return {
    openapi: "3.1.0",
    info: {
      title: "SEO CMS Public API",
      version: PUBLIC_API_VERSION,
      description: [
        "Read-only REST API for headless integrations with the public storefront catalog.",
        "",
        "Authenticate with a bearer API key created in the admin API Center.",
        `Keys use the \`${API_KEY_PREFIX}\` prefix.`,
        "",
        "Available scopes:",
        scopeDescriptions,
      ].join("\n"),
      contact: {
        name: "API Center",
        url: `${serverUrl}/admin/api`,
      },
    },
    servers: [
      {
        url: serverUrl,
        description: "Current deployment",
      },
    ],
    tags: [
      { name: "Health", description: "Service availability probes" },
      { name: "Products", description: "Published product catalog" },
      { name: "Categories", description: "Published category catalog" },
      { name: "Pages", description: "Published content pages" },
      { name: "Brands", description: "Published brands" },
      { name: "Search", description: "Cross-entity catalog search" },
      { name: "SEO", description: "SEO profiles and metadata" },
      { name: "Media", description: "Published media metadata" },
      { name: "Settings", description: "Public site settings" },
      { name: "Sitemap", description: "Generated sitemap entries" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "API Key",
          description: `Bearer token using a CMS API key (${API_KEY_PREFIX}...)`,
        },
      },
      schemas: buildSchemas(),
      responses: standardErrorResponses(),
      parameters: {
        Slug: {
          name: "slug",
          in: "path",
          required: true,
          description: "Localized URL slug",
          schema: { type: "string" },
        },
        MediaId: {
          name: "id",
          in: "path",
          required: true,
          description: "Media asset UUID",
          schema: { type: "string", format: "uuid" },
        },
      },
    },
    paths: {
      "/api/v1/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          description: "Returns service readiness without authentication.",
          operationId: "getHealth",
          responses: {
            "200": {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["success", "data"],
                    properties: {
                      success: { type: "boolean", enum: ["true"] },
                      data: ref("HealthStatus"),
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/products": {
        get: {
          tags: ["Products"],
          summary: "List products",
          description: "Returns a paginated list of published products.",
          operationId: "listProducts",
          security: scopedSecurity("read:products"),
          parameters: paginationQueryParams(),
          responses: standardProtectedResponses(
            successResponse(
              { type: "array", items: ref("ProductCard") },
              "Paginated product list",
              true,
            ),
          ),
        },
      },
      "/api/v1/products/{slug}": {
        get: {
          tags: ["Products"],
          summary: "Get product",
          description: "Returns a single published product by localized slug.",
          operationId: "getProduct",
          security: scopedSecurity("read:products"),
          parameters: [paramRef("Slug"), langQueryParam()],
          responses: {
            ...standardProtectedResponses(
              successResponse(ref("ProductDetail"), "Product detail"),
            ),
            "404": responseRef("NotFound"),
          },
        },
      },
      "/api/v1/categories": {
        get: {
          tags: ["Categories"],
          summary: "List categories",
          description: "Returns a paginated list of published categories.",
          operationId: "listCategories",
          security: scopedSecurity("read:categories"),
          parameters: paginationQueryParams(),
          responses: standardProtectedResponses(
            successResponse(
              { type: "array", items: ref("CategoryCard") },
              "Paginated category list",
              true,
            ),
          ),
        },
      },
      "/api/v1/categories/{slug}": {
        get: {
          tags: ["Categories"],
          summary: "Get category",
          operationId: "getCategory",
          security: scopedSecurity("read:categories"),
          parameters: [paramRef("Slug"), langQueryParam()],
          responses: {
            ...standardProtectedResponses(
              successResponse(ref("CategoryDetail"), "Category detail"),
            ),
            "404": responseRef("NotFound"),
          },
        },
      },
      "/api/v1/pages/{slug}": {
        get: {
          tags: ["Pages"],
          summary: "Get page",
          operationId: "getPage",
          security: scopedSecurity("read:pages"),
          parameters: [paramRef("Slug"), langQueryParam()],
          responses: {
            ...standardProtectedResponses(successResponse(ref("PageDetail"), "Page detail")),
            "404": responseRef("NotFound"),
          },
        },
      },
      "/api/v1/brands/{slug}": {
        get: {
          tags: ["Brands"],
          summary: "Get brand",
          operationId: "getBrand",
          security: scopedSecurity("read:brands"),
          parameters: [paramRef("Slug"), langQueryParam()],
          responses: {
            ...standardProtectedResponses(successResponse(ref("BrandDetail"), "Brand detail")),
            "404": responseRef("NotFound"),
          },
        },
      },
      "/api/v1/search": {
        get: {
          tags: ["Search"],
          summary: "Search catalog",
          description: "Search products, categories, pages, and brands by query string.",
          operationId: "searchCatalog",
          security: scopedSecurity("read:search"),
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              description: "Search query",
              schema: { type: "string", minLength: 1, maxLength: 120 },
            },
            langQueryParam(),
            {
              name: "limit",
              in: "query",
              description: "Maximum results per entity type",
              schema: { type: "integer", minimum: 1, maximum: 25, default: 5 },
            },
          ],
          responses: standardProtectedResponses(
            successResponse(ref("SearchResult"), "Grouped search results"),
          ),
        },
      },
      "/api/v1/sitemap": {
        get: {
          tags: ["Sitemap"],
          summary: "Read sitemap entries",
          operationId: "getSitemap",
          security: scopedSecurity("read:sitemap"),
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", minimum: 1, default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", minimum: 1, maximum: 500, default: 100 },
            },
            {
              name: "lang",
              in: "query",
              schema: { type: "string", enum: ["uk", "en"] },
            },
            {
              name: "indexedOnly",
              in: "query",
              schema: { type: "string", enum: ["true", "false"], default: "true" },
            },
          ],
          responses: standardProtectedResponses(
            successResponse(ref("SitemapPayload"), "Sitemap summary and paginated entries", true),
          ),
        },
      },
      "/api/v1/seo/profiles": {
        get: {
          tags: ["SEO"],
          summary: "List SEO profiles",
          operationId: "listSeoProfiles",
          security: scopedSecurity("read:seo"),
          parameters: [
            ...paginationQueryParams(),
            {
              name: "ownerType",
              in: "query",
              schema: { type: "string", enum: ["product", "category", "page", "brand"] },
            },
            {
              name: "search",
              in: "query",
              schema: { type: "string", maxLength: 120 },
            },
          ],
          responses: standardProtectedResponses(
            successResponse(
              { type: "array", items: ref("SeoProfileItem") },
              "Paginated SEO profiles",
              true,
            ),
          ),
        },
      },
      "/api/v1/media/{id}": {
        get: {
          tags: ["Media"],
          summary: "Get media asset",
          operationId: "getMediaAsset",
          security: scopedSecurity("read:media"),
          parameters: [paramRef("MediaId")],
          responses: {
            ...standardProtectedResponses(successResponse(ref("MediaAsset"), "Media metadata")),
            "404": responseRef("NotFound"),
          },
        },
      },
      "/api/v1/settings/public": {
        get: {
          tags: ["Settings"],
          summary: "Get public settings",
          operationId: "getPublicSettings",
          security: scopedSecurity("read:settings"),
          parameters: [],
          responses: standardProtectedResponses(
            successResponse(ref("PublicSettings"), "Public site settings"),
          ),
        },
      },
    },
  };
}
