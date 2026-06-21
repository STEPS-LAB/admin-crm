import { z } from "zod";

import { CATEGORY_STATUSES } from "@/constants/categories";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categoryTranslationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(255)
    .regex(slugPattern, "Slug must be lowercase with hyphens only"),
  description: z.string().trim().nullable(),
});

export const categoryFormSchema = z.object({
  parentId: z.string().uuid().nullable(),
  sortOrder: z.coerce.number().int().min(0),
  status: z.enum(CATEGORY_STATUSES),
  translations: z.object({
    uk: categoryTranslationSchema,
    en: categoryTranslationSchema,
  }),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const categoryListFiltersSchema = z.object({
  q: z.string().trim().optional(),
  status: z.enum(CATEGORY_STATUSES).optional(),
});

export const categoryIdSchema = z.object({
  id: z.string().uuid(),
});

export const categoryStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(CATEGORY_STATUSES),
});
