import { z } from "zod";

import { ALLOWED_IMAGE_MIME_TYPES, MAX_MEDIA_UPLOAD_BYTES, MEDIA_LIBRARY_FILTERS } from "@/constants/media";

export const mediaListFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
  q: z.string().trim().optional(),
  mimeType: z.string().trim().optional(),
  filter: z.enum(MEDIA_LIBRARY_FILTERS).optional(),
});

export const mediaIdSchema = z.object({
  id: z.string().uuid(),
});

const nullableText = z
  .string()
  .trim()
  .max(500)
  .or(z.literal(""))
  .transform((value) => (value === "" ? null : value));

export const mediaMetadataSchema = z.object({
  altUk: nullableText,
  altEn: nullableText,
  titleUk: nullableText,
  captionUk: nullableText,
  captionEn: nullableText,
  titleEn: nullableText,
  copyright: nullableText,
  photographer: nullableText,
  license: nullableText,
  isPublic: z.coerce.boolean(),
});

export type MediaMetadataValues = z.infer<typeof mediaMetadataSchema>;

export const mediaUploadSchema = z.object({
  mimeType: z.enum(ALLOWED_IMAGE_MIME_TYPES),
  fileSize: z.number().int().positive().max(MAX_MEDIA_UPLOAD_BYTES, "File exceeds 25 MB limit"),
  originalFilename: z.string().trim().min(1).max(255),
});
