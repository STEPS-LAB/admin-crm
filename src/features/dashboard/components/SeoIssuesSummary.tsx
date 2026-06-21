import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

import type { SeoHealthSummary } from "@/types/dashboard";

export interface SeoIssuesSummaryProps {
  readonly health: SeoHealthSummary;
}

export function SeoIssuesSummary({ health }: SeoIssuesSummaryProps): React.JSX.Element {
  const groups = [
    {
      label: "Critical",
      count: health.criticalIssues,
      icon: AlertTriangle,
      className: "text-destructive",
    },
    {
      label: "Warnings",
      count: health.warnings,
      icon: Info,
      className: "text-yellow-600",
    },
    {
      label: "Recommendations",
      count: health.recommendations,
      icon: CheckCircle2,
      className: "text-muted-foreground",
    },
  ] as const;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">SEO issues</CardTitle>
          <CardDescription>Grouped findings from the latest analysis</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/seo">Open SEO Center</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {groups.map((group) => {
          const Icon = group.icon;

          return (
            <div
              key={group.label}
              className="flex items-center justify-between rounded-md border border-border/60 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4", group.className)} aria-hidden="true" />
                <span className="text-sm font-medium">{group.label}</span>
              </div>
              <span className={cn("text-lg font-semibold", group.className)}>{group.count}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
