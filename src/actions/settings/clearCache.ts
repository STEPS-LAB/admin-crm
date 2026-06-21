"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { CACHE_SCOPES } from "@/constants/cache";
import { clearApplicationCache } from "@/services/cacheService";

import type { ServerActionResult } from "@/types";
import type { CacheClearResult } from "@/services/cacheService";

const clearCacheSchema = z.object({
  scope: z.enum(CACHE_SCOPES),
});

export async function clearCacheAction(
  scope: string,
): Promise<ServerActionResult<CacheClearResult>> {
  const parsed = clearCacheSchema.safeParse({ scope });

  if (!parsed.success) {
    return { success: false, error: "Invalid cache scope", code: "VALIDATION_ERROR" };
  }

  try {
    const result = await clearApplicationCache(parsed.data.scope);
    revalidatePath("/admin/settings/cache");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clear cache",
      code: "CLEAR_FAILED",
    };
  }
}
