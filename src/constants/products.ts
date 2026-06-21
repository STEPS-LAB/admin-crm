export const PRODUCT_LIST_DEFAULT_PAGE_SIZE = 25;

export const PRODUCT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const PRODUCT_STATUSES = ["draft", "published", "archived", "hidden"] as const;

export const STOCK_STATUSES = ["in_stock", "out_of_stock", "preorder", "discontinued"] as const;

export const PRODUCT_QUALITY_FILTERS = ["no-seo", "no-desc", "no-short-desc"] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type StockStatus = (typeof STOCK_STATUSES)[number];

export type ProductQualityFilter = (typeof PRODUCT_QUALITY_FILTERS)[number];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
  hidden: "Hidden",
};

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  in_stock: "In stock",
  out_of_stock: "Out of stock",
  preorder: "Preorder",
  discontinued: "Discontinued",
};
