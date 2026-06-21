import { z } from "zod";

import {
  AUDIT_EXPORT_SOURCES,
  CATALOG_EXPORT_ENTITIES,
  CATALOG_IMPORT_ENTITIES,
  EXPORT_FORMATS,
  IMPORT_EXPORT_LIMITS,
} from "@/constants/import-export";
import { CATEGORY_STATUSES } from "@/constants/categories";
import { PRODUCT_STATUSES, STOCK_STATUSES } from "@/constants/products";
import { securityAuditFiltersSchema, historyAuditFiltersSchema } from "@/schemas/audit/auditSchemas";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const pricePattern = /^\d+(?:\.\d{1,2})?$/;

const optionalText = z
  .string()
  .trim()
  .or(z.literal(""))
  .transform((value) => (value === "" ? null : value));

export const exportFormatSchema = z.enum(EXPORT_FORMATS);

export const catalogImportEntitySchema = z.enum(CATALOG_IMPORT_ENTITIES);

export const catalogExportEntitySchema = z.enum(CATALOG_EXPORT_ENTITIES);

export const auditExportSourceSchema = z.enum(AUDIT_EXPORT_SOURCES);

export const productImportRowSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required").max(64),
  barcode: optionalText.pipe(z.string().max(64).nullable()),
  category_slug: z.string().trim().min(1, "Category slug is required"),
  brand_slug: optionalText,
  status: z.enum(PRODUCT_STATUSES).default("draft"),
  price: z.string().trim().regex(pricePattern, "Enter a valid price"),
  old_price: optionalText.pipe(
    z
      .string()
      .regex(pricePattern, "Enter a valid price")
      .nullable(),
  ),
  currency: z.string().trim().length(3, "Currency must be 3 letters").default("UAH"),
  stock_quantity: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
  stock_status: z.enum(STOCK_STATUSES).default("in_stock"),
  name_uk: z.string().trim().min(1, "Ukrainian name is required").max(255),
  slug_uk: z
    .string()
    .trim()
    .min(1, "Ukrainian slug is required")
    .max(255)
    .regex(slugPattern, "Slug must be lowercase with hyphens only"),
  short_description_uk: optionalText.pipe(z.string().max(500).nullable()),
  description_uk: optionalText,
  name_en: z.string().trim().min(1, "English name is required").max(255),
  slug_en: z
    .string()
    .trim()
    .min(1, "English slug is required")
    .max(255)
    .regex(slugPattern, "Slug must be lowercase with hyphens only"),
  short_description_en: optionalText.pipe(z.string().max(500).nullable()),
  description_en: optionalText,
});

export type ProductImportRow = z.infer<typeof productImportRowSchema>;

export const categoryImportRowSchema = z.object({
  parent_slug: optionalText,
  sort_order: z.coerce.number().int().min(0).default(0),
  status: z.enum(CATEGORY_STATUSES).default("draft"),
  name_uk: z.string().trim().min(1, "Ukrainian name is required").max(255),
  slug_uk: z
    .string()
    .trim()
    .min(1, "Ukrainian slug is required")
    .max(255)
    .regex(slugPattern, "Slug must be lowercase with hyphens only"),
  description_uk: optionalText,
  name_en: z.string().trim().min(1, "English name is required").max(255),
  slug_en: z
    .string()
    .trim()
    .min(1, "English slug is required")
    .max(255)
    .regex(slugPattern, "Slug must be lowercase with hyphens only"),
  description_en: optionalText,
});

export type CategoryImportRow = z.infer<typeof categoryImportRowSchema>;

export const catalogImportPreviewSchema = z.object({
  entity: catalogImportEntitySchema,
  format: exportFormatSchema,
  content: z.string().trim().min(1, "File content is required").max(5_000_000),
});

export const catalogImportCommitSchema = z.object({
  entity: catalogImportEntitySchema,
  rows: z.array(z.record(z.unknown())).min(1).max(IMPORT_EXPORT_LIMITS.maxImportRows),
});

export const catalogImportRollbackSchema = z.object({
  createdProductIds: z.array(z.string().uuid()).max(IMPORT_EXPORT_LIMITS.maxImportRows).default([]),
  createdCategoryIds: z.array(z.string().uuid()).max(IMPORT_EXPORT_LIMITS.maxImportRows).default([]),
});

export const catalogExportRequestSchema = z.object({
  entity: catalogExportEntitySchema,
  format: exportFormatSchema,
});

export const auditExportRequestSchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("history"),
    format: exportFormatSchema,
    q: z.string().trim().optional(),
    entityType: historyAuditFiltersSchema.shape.entityType,
    operation: historyAuditFiltersSchema.shape.operation,
  }),
  z.object({
    source: z.literal("security"),
    format: exportFormatSchema,
    q: z.string().trim().optional(),
    action: securityAuditFiltersSchema.shape.action,
  }),
]);
