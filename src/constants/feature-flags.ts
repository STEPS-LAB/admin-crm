export const FEATURE_FLAG_ENVIRONMENTS = ["all", "development", "staging", "production"] as const;

export type FeatureFlagEnvironment = (typeof FEATURE_FLAG_ENVIRONMENTS)[number];

export const FEATURE_FLAG_AVAILABILITY = ["bundled", "coming_soon"] as const;

export type FeatureFlagAvailability = (typeof FEATURE_FLAG_AVAILABILITY)[number];

export const FEATURE_FLAG_AVAILABILITY_LABELS: Record<FeatureFlagAvailability, string> = {
  bundled: "Bundled",
  coming_soon: "Coming soon",
};

export interface BundledFeatureFlagDefinition {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly environment: FeatureFlagEnvironment;
  readonly availability: FeatureFlagAvailability;
  readonly defaultEnabled: boolean;
}

export const BUNDLED_FEATURE_FLAGS: readonly BundledFeatureFlagDefinition[] = [
  {
    slug: "experimental-dashboard",
    name: "Experimental Dashboard",
    description: "Preview upcoming dashboard widgets and layout experiments.",
    environment: "development",
    availability: "bundled",
    defaultEnabled: false,
  },
  {
    slug: "realtime-debug",
    name: "Realtime Debug",
    description: "Stream realtime diagnostics for collaborative admin sessions.",
    environment: "development",
    availability: "bundled",
    defaultEnabled: false,
  },
  {
    slug: "developer-toolbar",
    name: "Developer Toolbar",
    description: "Expose quick links to logs, cache controls, and environment metadata.",
    environment: "all",
    availability: "bundled",
    defaultEnabled: false,
  },
  {
    slug: "future-ai-module",
    name: "Future AI Module",
    description: "Prepared architecture for AI-assisted metadata and content workflows.",
    environment: "all",
    availability: "coming_soon",
    defaultEnabled: false,
  },
  {
    slug: "future-blog",
    name: "Future Blog",
    description: "Article publishing, categories, and editorial SEO templates.",
    environment: "all",
    availability: "coming_soon",
    defaultEnabled: false,
  },
  {
    slug: "public-api-v1",
    name: "Public API v1",
    description: "Headless read API for products, categories, pages, brands, search, sitemap, SEO, and media.",
    environment: "all",
    availability: "bundled",
    defaultEnabled: true,
  },
] as const;
