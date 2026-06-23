import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPublicSiteMessage } from "@/lib/public-site/messages";

import type { PublicSiteHomepageContent, PublicSiteLanguage } from "@/types/public-site";

export interface SiteHeroProps {
  readonly siteName: string;
  readonly siteDescription: string | null;
  readonly homepage: PublicSiteHomepageContent | null;
  readonly publishedProducts: number;
  readonly publishedCategories: number;
  readonly language: PublicSiteLanguage;
}

export function SiteHero({
  siteName,
  siteDescription,
  homepage,
  publishedProducts,
  publishedCategories,
  language,
}: SiteHeroProps): React.JSX.Element {
  const title = homepage?.title ?? siteName;
  const description =
    homepage?.excerpt ??
    siteDescription ??
    getPublicSiteMessage(language, "hero.defaultDescription");

  return (
    <section
      id="hero"
      className="from-accent/30 to-background scroll-mt-24 border-b bg-gradient-to-b"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:px-6 md:py-24">
        <div className="space-y-6">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            {getPublicSiteMessage(language, "hero.badge")}
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
            <p className="text-muted-foreground max-w-2xl text-lg">{description}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="#products">
                {getPublicSiteMessage(language, "hero.browseProducts")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#seo">{getPublicSiteMessage(language, "hero.seoPerformance")}</a>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-card rounded-xl border p-5 shadow-sm">
            <p className="text-muted-foreground text-sm">
              {getPublicSiteMessage(language, "hero.publishedProducts")}
            </p>
            <p className="mt-2 text-3xl font-semibold">{publishedProducts}</p>
          </div>
          <div className="bg-card rounded-xl border p-5 shadow-sm">
            <p className="text-muted-foreground text-sm">
              {getPublicSiteMessage(language, "hero.publishedCategories")}
            </p>
            <p className="mt-2 text-3xl font-semibold">{publishedCategories}</p>
          </div>
          <div className="bg-card rounded-xl border p-5 shadow-sm sm:col-span-2">
            <p className="text-muted-foreground text-sm">
              {getPublicSiteMessage(language, "hero.managedInAdmin")}
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {getPublicSiteMessage(language, "hero.managedInAdminDescription")}
            </p>
            <Button variant="link" className="mt-2 h-auto px-0" asChild>
              <Link href="/admin">{getPublicSiteMessage(language, "hero.openAdminPanel")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
