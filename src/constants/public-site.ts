export const PUBLIC_SITE_SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "products", label: "Products" },
  { id: "categories", label: "Categories" },
  { id: "seo", label: "SEO" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

export type PublicSiteSectionId = (typeof PUBLIC_SITE_SECTIONS)[number]["id"];

export const PUBLIC_SITE_PRODUCT_LIMIT = 8;
export const PUBLIC_SITE_CATEGORY_LIMIT = 8;
export const PUBLIC_SITE_SEARCH_LIMIT = 12;
export const PUBLIC_SITE_SEARCH_MAX_QUERY_LENGTH = 120;

export const PUBLIC_SITE_LANGUAGE_LABELS = {
  uk: "UA",
  en: "EN",
} as const;
