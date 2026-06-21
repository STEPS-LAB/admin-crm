export const BULK_OPERATION_MAX_IDS = 100;

export const CATALOG_TRASH_ENTITY_TYPES = ["product", "category", "page", "brand"] as const;

export type CatalogTrashEntityType = (typeof CATALOG_TRASH_ENTITY_TYPES)[number];

export const CATALOG_TRASH_ENTITY_LABELS: Record<CatalogTrashEntityType, string> = {
  product: "Products",
  category: "Categories",
  page: "Pages",
  brand: "Brands",
};

export const PRODUCT_SORT_FIELDS = ["updatedAt", "name", "price", "sku", "status"] as const;

export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];

export const PRODUCT_SORT_DIRECTIONS = ["asc", "desc"] as const;

export type ProductSortDirection = (typeof PRODUCT_SORT_DIRECTIONS)[number];

export const PRODUCT_SORT_FIELD_LABELS: Record<ProductSortField, string> = {
  updatedAt: "Last updated",
  name: "Name",
  price: "Price",
  sku: "SKU",
  status: "Status",
};
