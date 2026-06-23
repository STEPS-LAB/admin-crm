export const PUBLIC_SITE_SECTION_IDS = [
  "hero",
  "products",
  "categories",
  "seo",
  "about",
  "contact",
] as const;

export type PublicSiteSectionId = (typeof PUBLIC_SITE_SECTION_IDS)[number];

export const PUBLIC_SITE_PRODUCT_LIMIT = 8;
export const PUBLIC_SITE_CATEGORY_LIMIT = 8;
export const PUBLIC_SITE_SEARCH_LIMIT = 12;
export const PUBLIC_SITE_SEARCH_MAX_QUERY_LENGTH = 120;

export const PUBLIC_SITE_LANGUAGE_LABELS = {
  uk: "UA",
  en: "EN",
} as const;
