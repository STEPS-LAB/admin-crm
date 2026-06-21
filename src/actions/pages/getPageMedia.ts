"use server";

import { getPageMedia } from "@/services/pageMediaService";
import { pageIdParamSchema } from "@/schemas/media/entityMediaSchemas";

import type { EntityMediaCollection } from "@/types/entity-media";

export async function getPageMediaAction(pageId: string): Promise<EntityMediaCollection | null> {
  const parsed = pageIdParamSchema.safeParse({ pageId });

  if (!parsed.success) {
    return null;
  }

  return getPageMedia(parsed.data.pageId);
}
