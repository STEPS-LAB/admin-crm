export const REDIRECT_STATUS_CODES = ["301", "302", "307", "308"] as const;

export type RedirectStatusCode = (typeof REDIRECT_STATUS_CODES)[number];

export const SEO_OWNER_TYPES = [
  "product",
  "category",
  "page",
  "brand",
  "collection",
  "tag",
  "landing_page",
] as const;

export type SeoOwnerType = (typeof SEO_OWNER_TYPES)[number];

export const SEO_OWNER_TYPE_LABELS: Record<SeoOwnerType, string> = {
  product: "Product",
  category: "Category",
  page: "Page",
  brand: "Brand",
  collection: "Collection",
  tag: "Tag",
  landing_page: "Landing page",
};

export const SEO_CENTER_NAV = [
  { id: "overview", label: "Overview", href: "/admin/seo" },
  { id: "profiles", label: "Profiles", href: "/admin/seo/profiles" },
  { id: "templates", label: "Templates", href: "/admin/seo/templates" },
  { id: "internal-links", label: "Internal Links", href: "/admin/seo/internal-links" },
  { id: "redirects", label: "Redirects", href: "/admin/seo/redirects" },
  { id: "sitemap", label: "Sitemap", href: "/admin/seo/sitemap" },
  { id: "robots", label: "Robots", href: "/admin/seo/robots" },
] as const;

export const SEO_ENTITY_SCORE_WEIGHTS: Partial<Record<SeoOwnerType, number>> = {
  product: 0.3,
  category: 0.15,
  brand: 0.1,
  page: 0.15,
};
