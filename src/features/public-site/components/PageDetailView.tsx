import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SiteBreadcrumbs } from "@/features/public-site/components/SiteBreadcrumbs";
import { RichTextContent } from "@/features/public-site/components/RichTextContent";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { buildContentPageBreadcrumbTrail } from "@/lib/public-site/breadcrumbTrails";
import { cn } from "@/lib/utils/cn";

import type { PublicSiteLanguage, PublicSitePageDetail } from "@/types/public-site";

export interface PageDetailViewProps {
  readonly page: PublicSitePageDetail;
  readonly language: PublicSiteLanguage;
}

export function PageDetailView({ page, language }: PageDetailViewProps): React.JSX.Element {
  const scoreColors =
    page.seo?.overallScore !== null && page.seo?.overallScore !== undefined
      ? getSeoScoreColor(page.seo.overallScore)
      : null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <SiteBreadcrumbs language={language} items={buildContentPageBreadcrumbTrail(page, language)} />

      <article className="mt-8 space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{page.pageType}</Badge>
            {page.seo?.overallScore !== null && page.seo?.overallScore !== undefined && scoreColors ? (
              <Badge variant="outline" className={cn(scoreColors.text)}>
                SEO {page.seo.overallScore}
              </Badge>
            ) : null}
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">{page.title}</h1>
          {page.excerpt ? <p className="text-lg text-muted-foreground">{page.excerpt}</p> : null}
        </div>

        {page.content ? (
          <Card>
            <CardContent className="pt-6">
              <RichTextContent html={page.content} />
            </CardContent>
          </Card>
        ) : null}
      </article>
    </main>
  );
}
