import { z } from "zod";

import { REDIRECT_STATUS_CODES, SEO_OWNER_TYPES } from "@/constants/seo";

export const seoProfileListFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  q: z.string().trim().optional(),
  ownerType: z.enum(SEO_OWNER_TYPES).optional(),
  language: z.enum(["uk", "en"]).optional(),
});

export const seoProfileIdSchema = z.object({
  id: z.string().uuid(),
});

export const seoMetadataSchema = z.object({
  metaTitle: z.string().trim().max(255).nullable(),
  metaDescription: z.string().trim().max(500).nullable(),
  index: z.coerce.boolean(),
  follow: z.coerce.boolean(),
});

export type SeoMetadataValues = z.infer<typeof seoMetadataSchema>;

const pathPattern = /^\/[^\s]*$/;

export const redirectFormSchema = z.object({
  source: z
    .string()
    .trim()
    .min(1, "Source path is required")
    .max(2048)
    .regex(pathPattern, "Source must start with /"),
  destination: z
    .string()
    .trim()
    .min(1, "Destination is required")
    .max(2048)
    .refine(
      (value) => value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://"),
      "Destination must be a path or absolute URL",
    ),
  statusCode: z.enum(REDIRECT_STATUS_CODES),
  enabled: z.coerce.boolean(),
});

export type RedirectFormValues = z.infer<typeof redirectFormSchema>;

export const redirectListFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  q: z.string().trim().optional(),
  enabled: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
});

export const redirectIdSchema = z.object({
  id: z.string().uuid(),
});
