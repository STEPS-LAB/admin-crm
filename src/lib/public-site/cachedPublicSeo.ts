import { cache } from "react";

import {
  getPublicBrandSeo,
  getPublicCategorySeo,
  getPublicContentPageSeo,
  getPublicHomepageSeo,
  getPublicProductSeo,
  getPublicSearchSeo,
} from "@/services/publicSeoService";

export const getCachedPublicHomepageSeo = cache(getPublicHomepageSeo);
export const getCachedPublicProductSeo = cache(getPublicProductSeo);
export const getCachedPublicCategorySeo = cache(getPublicCategorySeo);
export const getCachedPublicContentPageSeo = cache(getPublicContentPageSeo);
export const getCachedPublicBrandSeo = cache(getPublicBrandSeo);
export const getCachedPublicSearchSeo = cache(getPublicSearchSeo);
