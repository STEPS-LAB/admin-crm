"use client";

import dynamic from "next/dynamic";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { AnalyticsSummary } from "@/types/analytics";

const AnalyticsTrendsCharts = dynamic(
  () => import("./AnalyticsTrendsCharts").then((mod) => mod.AnalyticsTrendsCharts),
  {
    loading: () => <ChartsSkeleton />,
    ssr: false,
  },
);

function ChartsSkeleton(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  );
}

export interface AnalyticsTrendsSectionProps {
  readonly summary: AnalyticsSummary;
}

export function AnalyticsTrendsSection({ summary }: AnalyticsTrendsSectionProps): React.JSX.Element {
  return <AnalyticsTrendsCharts summary={summary} />;
}
