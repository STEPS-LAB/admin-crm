export const EXPORT_FORMATS = ["csv", "json"] as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: "CSV",
  json: "JSON",
};

export const CATALOG_IMPORT_ENTITIES = ["products", "categories"] as const;

export type CatalogImportEntity = (typeof CATALOG_IMPORT_ENTITIES)[number];

export const CATALOG_IMPORT_ENTITY_LABELS: Record<CatalogImportEntity, string> = {
  products: "Products",
  categories: "Categories",
};

export const CATALOG_EXPORT_ENTITIES = ["products", "categories", "settings"] as const;

export type CatalogExportEntity = (typeof CATALOG_EXPORT_ENTITIES)[number];

export const CATALOG_EXPORT_ENTITY_LABELS: Record<CatalogExportEntity, string> = {
  products: "Products",
  categories: "Categories",
  settings: "Settings",
};

export const AUDIT_EXPORT_SOURCES = ["history", "security"] as const;

export type AuditExportSource = (typeof AUDIT_EXPORT_SOURCES)[number];

export const AUDIT_EXPORT_SOURCE_LABELS: Record<AuditExportSource, string> = {
  history: "Change history",
  security: "Security events",
};

export const IMPORT_EXPORT_LIMITS = {
  maxImportRows: 500,
  maxExportRows: 10_000,
  previewRowLimit: 25,
} as const;

export const PRODUCT_IMPORT_CSV_HEADERS = [
  "sku",
  "barcode",
  "category_slug",
  "brand_slug",
  "status",
  "price",
  "old_price",
  "currency",
  "stock_quantity",
  "stock_status",
  "name_uk",
  "slug_uk",
  "short_description_uk",
  "description_uk",
  "name_en",
  "slug_en",
  "short_description_en",
  "description_en",
] as const;

export const CATEGORY_IMPORT_CSV_HEADERS = [
  "parent_slug",
  "sort_order",
  "status",
  "name_uk",
  "slug_uk",
  "description_uk",
  "name_en",
  "slug_en",
  "description_en",
] as const;
