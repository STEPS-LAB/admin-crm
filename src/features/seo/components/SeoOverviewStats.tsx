import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeoHealthHero } from "@/features/dashboard/components/SeoHealthHero";

import type { SeoCenterOverview } from "@/types/seo-center";
import type { SeoHealthSummary } from "@/types/dashboard";

export interface SeoOverviewStatsProps {
  readonly overview: SeoCenterOverview;
}

export function SeoOverviewStats({ overview }: SeoOverviewStatsProps): React.JSX.Element {
  const health: SeoHealthSummary = {
    overallScore: overview.globalScore,
    metrics: [],
    criticalIssues: overview.criticalIssues,
    warnings: overview.warnings,
    recommendations: overview.recommendations,
    lastScanAt: overview.lastScanAt,
    profileCount: overview.profileCount,
  };

  return (
    <div className="space-y-6">
      <SeoHealthHero health={health} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">SEO profiles</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.profileCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Redirects</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.redirectCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Schema documents</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.schemaCount}</CardContent>
        </Card>
      </div>
    </div>
  );
}
