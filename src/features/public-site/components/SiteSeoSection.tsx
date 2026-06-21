import { AlertTriangle, CheckCircle2, Search, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { cn } from "@/lib/utils/cn";

import type { PublicSiteCatalogStats } from "@/types/public-site";
import type { SeoCenterOverview } from "@/types/seo-center";

export interface SiteSeoSectionProps {
  readonly overview: SeoCenterOverview;
  readonly catalogStats: PublicSiteCatalogStats;
}

export function SiteSeoSection({ overview, catalogStats }: SiteSeoSectionProps): React.JSX.Element {
  const scoreColors = getSeoScoreColor(overview.globalScore);

  return (
    <section id="seo" className="scroll-mt-24 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">SEO Center</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">SEO demonstration</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Real-time SEO health from profiles, redirects, structured data, and published catalog entities.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Global website score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className={cn("text-5xl font-semibold", scoreColors.text)}>{overview.globalScore}</p>
                <Progress value={overview.globalScore} className="mt-4" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Profiles</p>
                  <p className="font-medium">{overview.profileCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Redirects</p>
                  <p className="font-medium">{overview.redirectCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Schemas</p>
                  <p className="font-medium">{overview.schemaCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Recommendations</p>
                  <p className="font-medium">{overview.recommendations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Critical issues</CardTitle>
                <ShieldAlert className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-destructive">{overview.criticalIssues}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Warnings</CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{overview.warnings}</p>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Published catalog footprint</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="outline">{catalogStats.publishedProducts} products</Badge>
                <Badge variant="outline">{catalogStats.publishedCategories} categories</Badge>
                <Badge variant="outline">{catalogStats.publishedPages} pages</Badge>
                <Badge variant="outline">{catalogStats.publishedBrands} brands</Badge>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2">
              <CardHeader className="flex flex-row items-center gap-2">
                <Search className="h-4 w-4" />
                <CardTitle className="text-base">Entity SEO scores</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {overview.entityScores.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No analyzed SEO profiles yet.</p>
                ) : (
                  overview.entityScores.map((entity) => (
                    <div
                      key={entity.ownerType}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{entity.label}</p>
                        <p className="text-xs text-muted-foreground">{entity.profileCount} profiles</p>
                      </div>
                      <span className={cn("font-semibold", getSeoScoreColor(entity.averageScore).text)}>
                        {entity.averageScore}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="sm:col-span-2">
              <CardContent className="flex items-start gap-3 py-4 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Sitemap and robots endpoints are generated from the same published entities shown on this page.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
