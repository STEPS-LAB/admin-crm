import { revalidatePath, revalidateTag } from "next/cache";

import {
  ALL_CACHE_TAGS,
  CACHE_TAG_GROUPS,
  type CacheScope,
} from "@/constants/cache";

export interface CacheClearResult {
  readonly scope: CacheScope;
  readonly clearedTags: readonly string[];
  readonly clearedPaths: readonly string[];
}

const SCOPE_PATHS: Record<Exclude<CacheScope, "all">, readonly string[]> = {
  dashboard: ["/admin", "/admin/analytics"],
  seo: ["/admin/seo", "/admin/seo/profiles", "/admin/seo/redirects", "/admin/seo/sitemap", "/admin/seo/robots"],
  media: ["/admin/media"],
  settings: ["/admin/settings"],
};

function resolveTags(scope: CacheScope): readonly string[] {
  if (scope === "all") {
    return ALL_CACHE_TAGS;
  }

  return CACHE_TAG_GROUPS[scope];
}

function resolvePaths(scope: CacheScope): readonly string[] {
  if (scope === "all") {
    return Object.values(SCOPE_PATHS).flat();
  }

  return SCOPE_PATHS[scope];
}

export async function clearApplicationCache(scope: CacheScope): Promise<CacheClearResult> {
  const clearedTags = resolveTags(scope);
  const clearedPaths = resolvePaths(scope);

  for (const tag of clearedTags) {
    revalidateTag(tag);
  }

  for (const path of clearedPaths) {
    revalidatePath(path);
  }

  if (scope === "all" || scope === "seo") {
    revalidatePath("/sitemap.xml");
    revalidatePath("/robots.txt");
  }

  return {
    scope,
    clearedTags,
    clearedPaths,
  };
}
