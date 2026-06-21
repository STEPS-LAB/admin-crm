import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { PublicSiteHomepageContent } from "@/types/public-site";

export interface SiteHeroProps {
  readonly siteName: string;
  readonly siteDescription: string | null;
  readonly homepage: PublicSiteHomepageContent | null;
  readonly publishedProducts: number;
  readonly publishedCategories: number;
}

export function SiteHero({
  siteName,
  siteDescription,
  homepage,
  publishedProducts,
  publishedCategories,
}: SiteHeroProps): React.JSX.Element {
  const title = homepage?.title ?? siteName;
  const description =
    homepage?.excerpt ?? siteDescription ?? "Live storefront powered by the administration panel.";

  return (
    <section id="hero" className="scroll-mt-24 border-b bg-gradient-to-b from-accent/30 to-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:px-6 md:py-24">
        <div className="space-y-6">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            Live CMS data
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
            <p className="max-w-2xl text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="#products">
                Browse products
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#seo">SEO performance</a>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Published products</p>
            <p className="mt-2 text-3xl font-semibold">{publishedProducts}</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Published categories</p>
            <p className="mt-2 text-3xl font-semibold">{publishedCategories}</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-sm sm:col-span-2">
            <p className="text-sm text-muted-foreground">Managed in admin</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Every section below is rendered from published catalog, page, and SEO data configured in
              the dashboard.
            </p>
            <Button variant="link" className="mt-2 h-auto px-0" asChild>
              <Link href="/admin">Open administration panel</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
