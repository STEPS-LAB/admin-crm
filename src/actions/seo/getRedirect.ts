"use server";

import { getRedirect } from "@/services/redirectService";
import { redirectIdSchema } from "@/schemas/seo/seoSchemas";

import type { RedirectDetail } from "@/types/seo-center";

export async function getRedirectAction(id: string): Promise<RedirectDetail | null> {
  const parsed = redirectIdSchema.safeParse({ id });

  if (!parsed.success) {
    return null;
  }

  return getRedirect(parsed.data.id);
}
