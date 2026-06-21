import Link from "next/link";

import type { PublicBreadcrumbItem } from "@/lib/public-site/breadcrumbTrails";
import { getPublicSiteMessage } from "@/lib/public-site/messages";
import { buildPublicSiteHomeHref } from "@/lib/public-site/paths";

import type { PublicSiteLanguage } from "@/types/public-site";

export type SiteBreadcrumbItem = PublicBreadcrumbItem;

export interface SiteBreadcrumbsProps {
  readonly items: SiteBreadcrumbItem[];
  readonly language: PublicSiteLanguage;
}

export function SiteBreadcrumbs({ items, language }: SiteBreadcrumbsProps): React.JSX.Element {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href={buildPublicSiteHomeHref(language)} className="hover:text-foreground">
            {getPublicSiteMessage(language, "breadcrumb.home")}
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            <span aria-hidden>/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
