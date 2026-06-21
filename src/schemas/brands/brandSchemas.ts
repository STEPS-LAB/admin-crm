import { z } from "zod";

import {
  BRAND_PAGE_SIZE_OPTIONS,
  BRAND_STATUSES,
} from "@/constants/brands";
import { richTextFieldSchema } from "@/schemas/shared/richTextSchema";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .or(z.literal(""))
  .transform((value) => (value === "" ? null : value));

const optionalText = z
  .string()
  .trim()
  .max(255)
  .or(z.literal(""))
  .transform((value) => (value === "" ? null : value));

export const brandTranslationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  description: richTextFieldSchema,
});

export const brandFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(255)
    .regex(slugPattern, "Slug must be lowercase with hyphens only"),
  logoUrl: optionalUrl.nullable(),
  website: optionalUrl.nullable(),
  country: optionalText.nullable(),
  status: z.enum(BRAND_STATUSES),
  translations: z.object({
    uk: brandTranslationSchema,
    en: brandTranslationSchema,
  }),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;

export const brandListFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .refine((value) => BRAND_PAGE_SIZE_OPTIONS.includes(value as (typeof BRAND_PAGE_SIZE_OPTIONS)[number]), {
      message: "Invalid page size",
    })
    .default(25),
  q: z.string().trim().optional(),
  status: z.enum(BRAND_STATUSES).optional(),
  hasProducts: z
    .enum(["yes", "no"])
    .optional()
    .transform((value) => {
      if (value === "yes") {
        return true;
      }

      if (value === "no") {
        return false;
      }

      return undefined;
    }),
});

export type BrandListFiltersInput = z.infer<typeof brandListFiltersSchema>;

export const brandIdSchema = z.object({
  id: z.string().uuid(),
});

export const brandStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(BRAND_STATUSES),
});
