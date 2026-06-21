"use server";

import { getPage } from "@/services/pageService";
import { pageIdSchema } from "@/schemas/pages/pageSchemas";

import type { PageDetail } from "@/types/pages";

export async function getPageAction(id: string): Promise<PageDetail | null> {
  const parsed = pageIdSchema.safeParse({ id });

  if (!parsed.success) {
    return null;
  }

  return getPage(parsed.data.id);
}
