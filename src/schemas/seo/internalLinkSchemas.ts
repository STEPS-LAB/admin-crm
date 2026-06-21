import { z } from "zod";

import { SEO_OWNER_TYPES } from "@/constants/seo";

export const internalLinkFormSchema = z.object({
  seoProfileId: z.string().uuid(),
  targetOwnerType: z.enum(SEO_OWNER_TYPES),
  targetOwnerId: z.string().uuid(),
  anchorText: z.string().trim().max(255).nullable(),
});

export type InternalLinkFormValues = z.infer<typeof internalLinkFormSchema>;

export const internalLinkIdSchema = z.object({
  id: z.string().uuid(),
});

export const internalLinkProfileIdSchema = z.object({
  seoProfileId: z.string().uuid(),
});

export const internalLinkTargetSearchSchema = z.object({
  q: z.string().trim().min(1).max(120),
});
