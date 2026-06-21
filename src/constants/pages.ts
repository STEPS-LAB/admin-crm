export const PAGE_LIST_DEFAULT_PAGE_SIZE = 25;

export const PAGE_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const PAGE_STATUSES = ["draft", "published", "archived", "hidden"] as const;

export const PAGE_TYPES = ["homepage", "static", "landing", "legal", "custom"] as const;

export type PageStatus = (typeof PAGE_STATUSES)[number];

export type PageType = (typeof PAGE_TYPES)[number];

export const PAGE_STATUS_LABELS: Record<PageStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
  hidden: "Hidden",
};

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  homepage: "Homepage",
  static: "Static",
  landing: "Landing",
  legal: "Legal",
  custom: "Custom",
};
