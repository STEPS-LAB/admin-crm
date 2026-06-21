export const PLUGIN_TYPES = [
  "seo_extensions",
  "analytics",
  "media",
  "importers",
  "exporters",
  "storage",
  "authentication",
  "themes",
  "widgets",
  "developer_tools",
] as const;

export type PluginType = (typeof PLUGIN_TYPES)[number];

export const PLUGIN_TYPE_LABELS: Record<PluginType, string> = {
  seo_extensions: "SEO extensions",
  analytics: "Analytics",
  media: "Media",
  importers: "Importers",
  exporters: "Exporters",
  storage: "Storage",
  authentication: "Authentication",
  themes: "Themes",
  widgets: "Widgets",
  developer_tools: "Developer tools",
};

export const PLUGIN_AVAILABILITY = ["bundled", "coming_soon"] as const;

export type PluginAvailability = (typeof PLUGIN_AVAILABILITY)[number];

export const PLUGIN_AVAILABILITY_LABELS: Record<PluginAvailability, string> = {
  bundled: "Bundled",
  coming_soon: "Coming soon",
};

export interface BundledPluginDefinition {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly type: PluginType;
  readonly version: string;
  readonly availability: PluginAvailability;
  readonly isCore: boolean;
  readonly defaultEnabled: boolean;
}

export const BUNDLED_PLUGINS: readonly BundledPluginDefinition[] = [
  {
    slug: "catalog-manager",
    name: "Catalog Manager",
    description: "Products, categories, and brands with publish validation and SEO profiles.",
    type: "importers",
    version: "1.0.0",
    availability: "bundled",
    isCore: true,
    defaultEnabled: true,
  },
  {
    slug: "seo-center",
    name: "SEO Center",
    description: "Metadata, structured data, scoring, and entity-level SEO tooling.",
    type: "seo_extensions",
    version: "1.0.0",
    availability: "bundled",
    isCore: true,
    defaultEnabled: true,
  },
  {
    slug: "seo-automation",
    name: "SEO Automation",
    description: "Automatic metadata and schema generation for catalog and content entities.",
    type: "seo_extensions",
    version: "1.0.0",
    availability: "bundled",
    isCore: false,
    defaultEnabled: true,
  },
  {
    slug: "structured-data",
    name: "Structured Data Generator",
    description: "JSON-LD documents with full visibility and manual override support.",
    type: "seo_extensions",
    version: "1.0.0",
    availability: "bundled",
    isCore: false,
    defaultEnabled: true,
  },
  {
    slug: "redirect-manager",
    name: "Redirect Manager",
    description: "301/302 rules with loop detection and audit history.",
    type: "seo_extensions",
    version: "1.0.0",
    availability: "bundled",
    isCore: false,
    defaultEnabled: true,
  },
  {
    slug: "sitemap-generator",
    name: "Sitemap Generator",
    description: "Dynamic XML sitemap with image support and admin controls.",
    type: "seo_extensions",
    version: "1.0.0",
    availability: "bundled",
    isCore: true,
    defaultEnabled: true,
  },
  {
    slug: "robots-manager",
    name: "Robots.txt Manager",
    description: "Robots directives with validation and live preview.",
    type: "seo_extensions",
    version: "1.0.0",
    availability: "bundled",
    isCore: false,
    defaultEnabled: true,
  },
  {
    slug: "analytics-dashboard",
    name: "Analytics Dashboard",
    description: "KPI trends, media usage, and activity insights for administrators.",
    type: "analytics",
    version: "1.0.0",
    availability: "bundled",
    isCore: false,
    defaultEnabled: true,
  },
  {
    slug: "media-library",
    name: "Media Library",
    description: "Uploads, collections, alt-text SEO, and entity attachments.",
    type: "media",
    version: "1.0.0",
    availability: "bundled",
    isCore: true,
    defaultEnabled: true,
  },
  {
    slug: "rich-text-editor",
    name: "Rich Text Editor",
    description: "Tiptap-powered content editing with server-side sanitization.",
    type: "media",
    version: "1.0.0",
    availability: "bundled",
    isCore: true,
    defaultEnabled: true,
  },
  {
    slug: "audit-logging",
    name: "Audit Logging",
    description: "Immutable change history and security event tracking.",
    type: "developer_tools",
    version: "1.0.0",
    availability: "bundled",
    isCore: true,
    defaultEnabled: true,
  },
  {
    slug: "notifications",
    name: "Notifications Center",
    description: "In-app alerts for SEO, system, and workflow events.",
    type: "developer_tools",
    version: "1.0.0",
    availability: "bundled",
    isCore: false,
    defaultEnabled: true,
  },
  {
    slug: "csv-importer",
    name: "CSV Importer",
    description: "Bulk import products and categories from spreadsheet files.",
    type: "importers",
    version: "0.1.0",
    availability: "coming_soon",
    isCore: false,
    defaultEnabled: false,
  },
  {
    slug: "excel-exporter",
    name: "Excel Exporter",
    description: "Export catalog and SEO reports to Excel workbooks.",
    type: "exporters",
    version: "0.1.0",
    availability: "coming_soon",
    isCore: false,
    defaultEnabled: false,
  },
  {
    slug: "meilisearch",
    name: "Meilisearch Integration",
    description: "External search index with hybrid fallback to PostgreSQL.",
    type: "developer_tools",
    version: "0.1.0",
    availability: "coming_soon",
    isCore: false,
    defaultEnabled: false,
  },
  {
    slug: "theme-marketplace",
    name: "Theme Marketplace",
    description: "Installable storefront themes with live preview.",
    type: "themes",
    version: "0.1.0",
    availability: "coming_soon",
    isCore: false,
    defaultEnabled: false,
  },
  {
    slug: "oauth-auth",
    name: "OAuth Authentication",
    description: "Google, GitHub, and enterprise SSO sign-in providers.",
    type: "authentication",
    version: "0.1.0",
    availability: "coming_soon",
    isCore: false,
    defaultEnabled: false,
  },
  {
    slug: "s3-storage",
    name: "S3 Storage Adapter",
    description: "Offload media assets to S3-compatible object storage.",
    type: "storage",
    version: "0.1.0",
    availability: "coming_soon",
    isCore: false,
    defaultEnabled: false,
  },
  {
    slug: "homepage-widgets",
    name: "Homepage Widgets",
    description: "Drag-and-drop blocks for the public storefront homepage.",
    type: "widgets",
    version: "0.1.0",
    availability: "coming_soon",
    isCore: false,
    defaultEnabled: false,
  },
] as const;

export const PLUGIN_SANDBOX_PRINCIPLES = [
  "Plugins run through services, never direct database access from UI.",
  "Each plugin declares scopes and hooks before activation.",
  "Third-party code executes in isolated server boundaries.",
  "Configuration changes are audit-logged and versioned.",
] as const;
