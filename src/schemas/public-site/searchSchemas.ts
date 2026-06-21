import { z } from "zod";

import { PUBLIC_SITE_SEARCH_MAX_QUERY_LENGTH } from "@/constants/public-site";

export const publicSiteSearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(PUBLIC_SITE_SEARCH_MAX_QUERY_LENGTH),
});

export type PublicSiteSearchQuery = z.infer<typeof publicSiteSearchQuerySchema>;

export function parsePublicSiteSearchQuery(
  rawQuery: string | undefined,
): PublicSiteSearchQuery | null {
  if (!rawQuery?.trim()) {
    return null;
  }

  const parsed = publicSiteSearchQuerySchema.safeParse({ q: rawQuery });

  return parsed.success ? parsed.data : null;
}
