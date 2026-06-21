"use server";

import { getMedia } from "@/services/mediaService";
import { mediaIdSchema } from "@/schemas/media/mediaSchemas";

import type { MediaDetail } from "@/types/media";

export async function getMediaAction(id: string): Promise<MediaDetail | null> {
  const parsed = mediaIdSchema.safeParse({ id });

  if (!parsed.success) {
    return null;
  }

  return getMedia(parsed.data.id);
}
