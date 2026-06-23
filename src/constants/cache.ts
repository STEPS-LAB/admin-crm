export const CACHE_SCOPES = ["dashboard", "seo", "media", "settings", "all"] as const;

export type CacheScope = (typeof CACHE_SCOPES)[number];

export const CACHE_SCOPE_LABELS: Record<CacheScope, string> = {
  dashboard: "Dashboard",
  seo: "SEO",
  media: "Media",
  settings: "Settings",
  all: "Entire application",
};

export const CACHE_DURATION_LIMITS = {
  minSeconds: 60,
  maxSeconds: 86_400,
  defaultSeconds: 3600,
} as const;

export const CACHE_TAG_GROUPS: Record<Exclude<CacheScope, "all">, readonly string[]> = {
  dashboard: ["dashboard", "analytics"],
  seo: ["seo", "sitemap", "robots", "redirects"],
  media: ["media"],
  settings: ["settings", "public-settings"],
};

export const ALL_CACHE_TAGS = [
  ...CACHE_TAG_GROUPS.dashboard,
  ...CACHE_TAG_GROUPS.seo,
  ...CACHE_TAG_GROUPS.media,
  ...CACHE_TAG_GROUPS.settings,
] as const;

export const SETTINGS_DATA_CACHE_TAG = "settings" as const;

/** Cross-request settings cache TTL for admin shell and security checks. */
export const SETTINGS_DATA_CACHE_SECONDS = 60;

export const PUBLIC_SITE_CACHE_TAG = "public-site" as const;

/** Cross-request cache TTL for public storefront pages. */
export const PUBLIC_SITE_PAGE_CACHE_SECONDS = 120;
