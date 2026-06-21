import { z } from "zod";

import {
  SEO_TEMPLATE_LANGUAGES,
  SEO_TEMPLATE_OWNER_TYPES,
} from "@/constants/seo-templates";

const templateFieldSchema = z.string().trim().max(500).nullable();

export const seoTemplateFormSchema = z.object({
  ownerType: z.enum(SEO_TEMPLATE_OWNER_TYPES),
  language: z.enum(SEO_TEMPLATE_LANGUAGES),
  name: z.string().trim().min(1, "Name is required").max(120),
  metaTitleTemplate: templateFieldSchema,
  metaDescriptionTemplate: templateFieldSchema,
  ogTitleTemplate: templateFieldSchema,
  ogDescriptionTemplate: templateFieldSchema,
  isDefault: z.coerce.boolean(),
});

export type SeoTemplateFormValues = z.infer<typeof seoTemplateFormSchema>;

export const seoTemplateIdSchema = z.object({
  id: z.string().uuid(),
});

export const seoTemplateListFiltersSchema = z.object({
  ownerType: z.enum(SEO_TEMPLATE_OWNER_TYPES).optional(),
  language: z.enum(SEO_TEMPLATE_LANGUAGES).optional(),
});

export const seoTemplatePreviewSchema = z.object({
  ownerType: z.enum(SEO_TEMPLATE_OWNER_TYPES),
  language: z.enum(SEO_TEMPLATE_LANGUAGES),
  metaTitleTemplate: templateFieldSchema,
  metaDescriptionTemplate: templateFieldSchema,
  ogTitleTemplate: templateFieldSchema,
  ogDescriptionTemplate: templateFieldSchema,
  seoProfileId: z.string().uuid().optional(),
});

export const applySeoTemplateSchema = z.object({
  seoProfileId: z.string().uuid(),
  templateId: z.string().uuid(),
});
