import { z } from "zod";

import {
  PRODUCT_PAGE_SIZE_OPTIONS,
  PRODUCT_QUALITY_FILTERS,
  PRODUCT_STATUSES,
  STOCK_STATUSES,
} from "@/constants/products";
import {
  PRODUCT_SORT_DIRECTIONS,
  PRODUCT_SORT_FIELDS,
} from "@/constants/catalog";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productTranslationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(255)
    .regex(slugPattern, "Slug must be lowercase with hyphens only"),
  shortDescription: z.string().trim().max(500).nullable(),
  description: z.string().trim().nullable(),
});

export const productFormSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required").max(64),
  barcode: z.string().trim().max(64).nullable(),
  categoryId: z.string().uuid("Select a category"),
  brandId: z.string().uuid().nullable(),
  status: z.enum(PRODUCT_STATUSES),
  price: z
    .string()
    .trim()
    .regex(/^\d+(?:\.\d{1,2})?$/, "Enter a valid price"),
  oldPrice: z
    .string()
    .trim()
    .regex(/^\d+(?:\.\d{1,2})?$/, "Enter a valid price")
    .nullable(),
  currency: z.string().trim().length(3, "Currency must be 3 letters"),
  stockQuantity: z.coerce.number().int().min(0, "Stock cannot be negative"),
  stockStatus: z.enum(STOCK_STATUSES),
  translations: z.object({
    uk: productTranslationSchema,
    en: productTranslationSchema,
  }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const productListFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .refine((value) => PRODUCT_PAGE_SIZE_OPTIONS.includes(value as (typeof PRODUCT_PAGE_SIZE_OPTIONS)[number]), {
      message: "Invalid page size",
    })
    .default(25),
  q: z.string().trim().optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  stockStatus: z.enum(STOCK_STATUSES).optional(),
  filter: z.enum(PRODUCT_QUALITY_FILTERS).optional(),
  sortBy: z.enum(PRODUCT_SORT_FIELDS).optional(),
  sortDir: z.enum(PRODUCT_SORT_DIRECTIONS).optional(),
});

export type ProductListFiltersInput = z.infer<typeof productListFiltersSchema>;

export const productIdSchema = z.object({
  id: z.string().uuid(),
});

export const productStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(PRODUCT_STATUSES),
});
