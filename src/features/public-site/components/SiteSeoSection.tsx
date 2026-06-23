import { AlertTriangle, CheckCircle2, Search, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { getPublicSeoOwnerTypeLabel, getPublicSiteMessage } from "@/lib/public-site/messages";
import { cn } from "@/lib/utils/cn";

import type { PublicSiteCatalogStats, PublicSiteLanguage } from "@/types/public-site";
import type { SeoCenterOverview } from "@/types/seo-center";

export interface SiteSeoSectionProps {
  readonly overview: SeoCenterOverview;
  readonly catalogStats: PublicSiteCatalogStats;
  readonly language: PublicSiteLanguage;
}

export function SiteSeoSection({
  overview,
  catalogStats,
  language,
}: SiteSeoSectionProps): React.JSX.Element {
  const scoreColors = getSeoScoreColor(overview.globalScore);

  return (
    <section id="seo" className="scroll-mt-24 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8">
          <p className="text-primary text-sm font-medium">
            {getPublicSiteMessage(language, "seo.eyebrow")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            {getPublicSiteMessage(language, "seo.title")}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {getPublicSiteMessage(language, "seo.description")}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {getPublicSiteMessage(language, "seo.globalScore")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className={cn("text-5xl font-semibold", scoreColors.text)}>
                  {overview.globalScore}
                </p>
                <Progress value={overview.globalScore} className="mt-4" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    {getPublicSiteMessage(language, "seo.profiles")}
                  </p>
                  <p className="font-medium">{overview.profileCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {getPublicSiteMessage(language, "seo.redirects")}
                  </p>
                  <p className="font-medium">{overview.redirectCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {getPublicSiteMessage(language, "seo.schemas")}
                  </p>
                  <p className="font-medium">{overview.schemaCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {getPublicSiteMessage(language, "seo.recommendations")}
                  </p>
                  <p className="font-medium">{overview.recommendations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  {getPublicSiteMessage(language, "seo.criticalIssues")}
                </CardTitle>
                <ShieldAlert className="text-destructive h-4 w-4" />
              </CardHeader>
              <CardContent>
                <p className="text-destructive text-3xl font-semibold">{overview.criticalIssues}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  {getPublicSiteMessage(language, "seo.warnings")}
                </CardTitle>
                <AlertTriangle className="text-warning h-4 w-4" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{overview.warnings}</p>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">
                  {getPublicSiteMessage(language, "seo.catalogFootprint")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {getPublicSiteMessage(language, "seo.badge.products", {
                    count: String(catalogStats.publishedProducts),
                  })}
                </Badge>
                <Badge variant="outline">
                  {getPublicSiteMessage(language, "seo.badge.categories", {
                    count: String(catalogStats.publishedCategories),
                  })}
                </Badge>
                <Badge variant="outline">
                  {getPublicSiteMessage(language, "seo.badge.pages", {
                    count: String(catalogStats.publishedPages),
                  })}
                </Badge>
                <Badge variant="outline">
                  {getPublicSiteMessage(language, "seo.badge.brands", {
                    count: String(catalogStats.publishedBrands),
                  })}
                </Badge>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2">
              <CardHeader className="flex flex-row items-center gap-2">
                <Search className="h-4 w-4" />
                <CardTitle className="text-base">
                  {getPublicSiteMessage(language, "seo.entityScores")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {overview.entityScores.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    {getPublicSiteMessage(language, "seo.noProfiles")}
                  </p>
                ) : (
                  overview.entityScores.map((entity) => (
                    <div
                      key={entity.ownerType}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {getPublicSeoOwnerTypeLabel(language, entity.ownerType)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {getPublicSiteMessage(language, "seo.entityProfileCount", {
                            count: String(entity.profileCount),
                          })}
                        </p>
                      </div>
                      <span
                        className={cn("font-semibold", getSeoScoreColor(entity.averageScore).text)}
                      >
                        {entity.averageScore}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="sm:col-span-2">
              <CardContent className="text-muted-foreground flex items-start gap-3 py-4 text-sm">
                <CheckCircle2 className="text-success mt-0.5 h-4 w-4 shrink-0" />
                {getPublicSiteMessage(language, "seo.sitemapNote")}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
