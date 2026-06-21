import Link from "next/link";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { cn } from "@/lib/utils/cn";

import type { SeoHealthSummary } from "@/types/dashboard";

export interface SeoHealthMetricsProps {
  readonly health: SeoHealthSummary;
}

export function SeoHealthMetrics({ health }: SeoHealthMetricsProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">SEO metrics</CardTitle>
        <CardDescription>Average scores across analyzed SEO profiles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {health.metrics.length === 0 ? (
          <p className="text-sm text-muted-foreground">No SEO analysis data available yet.</p>
        ) : (
          health.metrics.map((metric) => {
            const colors = getSeoScoreColor(metric.score);

            return (
              <Link
                key={metric.id}
                href="/admin/seo"
                className="block space-y-2 rounded-md p-2 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{metric.label}</span>
                  <span className={cn("font-semibold", colors.text)}>{metric.score}</span>
                </div>
                <Progress value={metric.score} indicatorClassName={colors.progress} />
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
