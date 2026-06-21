"use server";

import { pageIdParamSchema } from "@/schemas/media/entityMediaSchemas";
import { getPage } from "@/services/pageService";
import { getOwnerSeoProfiles } from "@/services/seoProfileService";

import type { EntitySeoProfiles } from "@/types/seo-center";

export async function getPageSeoProfilesAction(pageId: string): Promise<EntitySeoProfiles | null> {
  const parsed = pageIdParamSchema.safeParse({ pageId });

  if (!parsed.success) {
    return null;
  }

  const page = await getPage(parsed.data.pageId);

  if (!page) {
    return null;
  }

  return getOwnerSeoProfiles("page", page.id, {
    uk: page.translations.uk.title,
    en: page.translations.en.title,
  });
}
