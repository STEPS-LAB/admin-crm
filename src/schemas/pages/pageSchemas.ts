import { z } from "zod";

import {
  PAGE_PAGE_SIZE_OPTIONS,
  PAGE_STATUSES,
  PAGE_TYPES,
} from "@/constants/pages";
import { richTextFieldSchema } from "@/schemas/shared/richTextSchema";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const pageTranslationSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(255)
    .regex(slugPattern, "Slug must be lowercase with hyphens only"),
  content: richTextFieldSchema,
  excerpt: z.string().trim().max(500).nullable(),
});

export const pageFormSchema = z.object({
  pageType: z.enum(PAGE_TYPES),
  status: z.enum(PAGE_STATUSES),
  isHomepage: z.coerce.boolean(),
  sortOrder: z.coerce.number().int().min(0),
  translations: z.object({
    uk: pageTranslationSchema,
    en: pageTranslationSchema,
  }),
});

export type PageFormValues = z.infer<typeof pageFormSchema>;

export const pageListFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .refine((value) => PAGE_PAGE_SIZE_OPTIONS.includes(value as (typeof PAGE_PAGE_SIZE_OPTIONS)[number]), {
      message: "Invalid page size",
    })
    .default(25),
  q: z.string().trim().optional(),
  status: z.enum(PAGE_STATUSES).optional(),
  pageType: z.enum(PAGE_TYPES).optional(),
});

export type PageListFiltersInput = z.infer<typeof pageListFiltersSchema>;

export const pageIdSchema = z.object({
  id: z.string().uuid(),
});

export const pageStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(PAGE_STATUSES),
});
