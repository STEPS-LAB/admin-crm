export const CATEGORY_LIST_DEFAULT_PAGE_SIZE = 25;

export const CATEGORY_STATUSES = ["draft", "published", "archived", "hidden"] as const;

export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

export const CATEGORY_STATUS_LABELS: Record<CategoryStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
  hidden: "Hidden",
};
