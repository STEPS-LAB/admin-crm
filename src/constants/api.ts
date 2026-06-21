export const API_KEY_PREFIX = "cms_live_";

export const PUBLIC_API_VERSION = "1.0.0";

export const PUBLIC_API_OPENAPI_PATH = "/api/v1/openapi.json";

export const WEBHOOK_SECRET_PREFIX = "whsec_";

export const DEFAULT_WEBHOOK_MAX_RETRIES = 5;

export const DEFAULT_WEBHOOK_RETRY_BASE_DELAY_SECONDS = 60;

export const WEBHOOK_DELIVERY_TIMEOUT_MS = 10_000;

export const WEBHOOK_RESPONSE_BODY_MAX_LENGTH = 2_000;

export const API_KEY_STATUSES = ["active", "revoked"] as const;

export type ApiKeyStatus = (typeof API_KEY_STATUSES)[number];

export const API_KEY_STATUS_LABELS: Record<ApiKeyStatus, string> = {
  active: "Active",
  revoked: "Revoked",
};

export const API_SCOPES = [
  "read:products",
  "read:categories",
  "read:pages",
  "read:brands",
  "read:seo",
  "read:media",
  "read:settings",
  "read:search",
  "read:sitemap",
] as const;

export type ApiScope = (typeof API_SCOPES)[number];

export const API_SCOPE_LABELS: Record<ApiScope, string> = {
  "read:products": "Read products",
  "read:categories": "Read categories",
  "read:pages": "Read pages",
  "read:brands": "Read brands",
  "read:seo": "Read SEO data",
  "read:media": "Read media",
  "read:settings": "Read settings",
  "read:search": "Search catalog",
  "read:sitemap": "Read sitemap",
};

export const DEFAULT_API_RATE_LIMIT_PER_MINUTE = 100;

export const API_ARCHITECTURE_LAYERS = [
  "Presentation",
  "Server Actions",
  "Services",
  "Repositories",
  "Database",
] as const;

export interface PreparedApiEndpoint {
  readonly method: "GET" | "POST" | "PUT" | "DELETE";
  readonly path: string;
  readonly description: string;
  readonly status: "active" | "prepared";
  readonly scope?: ApiScope;
}

export const PREPARED_API_ENDPOINTS: readonly PreparedApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/v1/products",
    description: "List published products with pagination and filters",
    status: "active",
    scope: "read:products",
  },
  {
    method: "GET",
    path: "/api/v1/products/{slug}",
    description: "Fetch a single published product",
    status: "active",
    scope: "read:products",
  },
  {
    method: "GET",
    path: "/api/v1/categories",
    description: "List published categories",
    status: "active",
    scope: "read:categories",
  },
  {
    method: "GET",
    path: "/api/v1/categories/{slug}",
    description: "Fetch a single published category",
    status: "active",
    scope: "read:categories",
  },
  {
    method: "GET",
    path: "/api/v1/pages/{slug}",
    description: "Fetch a published page",
    status: "active",
    scope: "read:pages",
  },
  {
    method: "GET",
    path: "/api/v1/brands/{slug}",
    description: "Fetch a published brand",
    status: "active",
    scope: "read:brands",
  },
  {
    method: "GET",
    path: "/api/v1/seo/profiles",
    description: "Read SEO profiles and metadata",
    status: "active",
    scope: "read:seo",
  },
  {
    method: "GET",
    path: "/api/v1/media/{id}",
    description: "Fetch media asset metadata",
    status: "active",
    scope: "read:media",
  },
  {
    method: "GET",
    path: "/api/v1/settings/public",
    description: "Read public site settings",
    status: "active",
    scope: "read:settings",
  },
  {
    method: "GET",
    path: "/api/v1/search",
    description: "Search catalog entities",
    status: "active",
    scope: "read:search",
  },
  {
    method: "GET",
    path: "/api/v1/sitemap",
    description: "Read generated sitemap index",
    status: "active",
    scope: "read:sitemap",
  },
  {
    method: "GET",
    path: "/api/v1/health",
    description: "Service health and readiness probe",
    status: "active",
  },
  {
    method: "GET",
    path: PUBLIC_API_OPENAPI_PATH,
    description: "OpenAPI 3.1 specification for this API",
    status: "active",
  },
] as const;

export const PREPARED_WEBHOOK_EVENTS = [
  "product.created",
  "product.updated",
  "category.updated",
  "seo.audit.completed",
  "backup.completed",
  "media.uploaded",
  "settings.updated",
  "import.completed",
  "export.completed",
] as const;

export type PreparedWebhookEvent = (typeof PREPARED_WEBHOOK_EVENTS)[number];

export const WEBHOOK_EVENT_LABELS: Record<PreparedWebhookEvent, string> = {
  "product.created": "Product created",
  "product.updated": "Product updated",
  "category.updated": "Category updated",
  "seo.audit.completed": "SEO audit completed",
  "backup.completed": "Backup completed",
  "media.uploaded": "Media uploaded",
  "settings.updated": "Settings updated",
  "import.completed": "Import completed",
  "export.completed": "Export completed",
};
