import { z } from "zod";

import { SUPPORTED_LANGUAGES } from "@/constants/settings";

export const publicApiLanguageSchema = z.enum(SUPPORTED_LANGUAGES).default("uk");

export const publicApiPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const publicApiListQuerySchema = publicApiPaginationSchema.extend({
  lang: publicApiLanguageSchema,
});

export const publicApiDetailQuerySchema = z.object({
  lang: publicApiLanguageSchema,
});

const publicApiCatalogOwnerTypes = ["product", "category", "page", "brand"] as const;

export const publicApiSeoOwnerTypeSchema = z.enum(publicApiCatalogOwnerTypes);

export const publicApiSearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
  lang: publicApiLanguageSchema,
  limit: z.coerce.number().int().min(1).max(25).default(5),
});

export const publicApiSitemapQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  lang: publicApiLanguageSchema.optional(),
  indexedOnly: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
});

export const publicApiSeoProfilesQuerySchema = publicApiPaginationSchema.extend({
  lang: publicApiLanguageSchema.optional(),
  ownerType: publicApiSeoOwnerTypeSchema.optional(),
  search: z.string().trim().max(120).optional(),
});

export type PublicApiListQuery = z.infer<typeof publicApiListQuerySchema>;
export type PublicApiDetailQuery = z.infer<typeof publicApiDetailQuerySchema>;
export type PublicApiSearchQuery = z.infer<typeof publicApiSearchQuerySchema>;
export type PublicApiSitemapQuery = z.infer<typeof publicApiSitemapQuerySchema>;
export type PublicApiSeoProfilesQuery = z.infer<typeof publicApiSeoProfilesQuerySchema>;

export const PUBLIC_API_CATALOG_OWNER_TYPES = publicApiCatalogOwnerTypes;
