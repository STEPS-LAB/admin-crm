import { unstable_cache } from "next/cache";

import { PUBLIC_SITE_PAGE_CACHE_SECONDS, PUBLIC_SITE_CACHE_TAG } from "@/constants/cache";
import { getPublicSitePageData } from "@/services/publicSiteService";

import type { PublicSiteLanguage, PublicSitePageData } from "@/types/public-site";

export function getCachedPublicSitePageData(
  language: PublicSiteLanguage,
): Promise<PublicSitePageData> {
  return unstable_cache(
    async (lang: PublicSiteLanguage) => {
      const { getSettings } = await import("@/services/settingsService");
      const settings = await getSettings();
      return getPublicSitePageData(lang, settings);
    },
    ["public-site-homepage-data"],
    {
      revalidate: PUBLIC_SITE_PAGE_CACHE_SECONDS,
      tags: [PUBLIC_SITE_CACHE_TAG, "settings"],
    },
  )(language);
}
