export const BRAND_LIST_DEFAULT_PAGE_SIZE = 25;

export const BRAND_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const BRAND_STATUSES = ["draft", "published", "archived", "hidden"] as const;

export type BrandStatus = (typeof BRAND_STATUSES)[number];

export const BRAND_STATUS_LABELS: Record<BrandStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
  hidden: "Hidden",
};
