import { normalizeSiteUrl } from "@/lib/seo/publicUrls";
import { getPublicSiteMessage } from "@/lib/public-site/messages";
import { buildPublicSiteHomeHref } from "@/lib/public-site/paths";

import type { PublicBreadcrumbItem } from "@/lib/public-site/breadcrumbTrails";
import type { PublicSiteLanguage } from "@/types/public-site";

function toAbsoluteUrl(siteUrl: string, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const base = normalizeSiteUrl(siteUrl);
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildBreadcrumbListJsonLd(input: {
  readonly siteUrl: string;
  readonly language: PublicSiteLanguage;
  readonly items: readonly PublicBreadcrumbItem[];
  readonly currentPageUrl?: string;
}): Record<string, unknown> {
  const homeItem = {
    "@type": "ListItem",
    position: 1,
    name: getPublicSiteMessage(input.language, "breadcrumb.home"),
    item: toAbsoluteUrl(input.siteUrl, buildPublicSiteHomeHref(input.language)),
  };

  const trailItems = input.items.map((item, index) => {
    const position = index + 2;
    const listItem: Record<string, unknown> = {
      "@type": "ListItem",
      position,
      name: item.label,
    };

    if (item.href) {
      listItem.item = toAbsoluteUrl(input.siteUrl, item.href);
    } else if (index === input.items.length - 1 && input.currentPageUrl) {
      listItem.item = input.currentPageUrl;
    }

    return listItem;
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [homeItem, ...trailItems],
  };
}
