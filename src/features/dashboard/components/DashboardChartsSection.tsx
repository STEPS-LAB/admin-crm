"use client";

import dynamic from "next/dynamic";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { DashboardSummary } from "@/types/dashboard";

const DashboardCharts = dynamic(
  () => import("./DashboardCharts").then((mod) => mod.DashboardCharts),
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

export interface DashboardChartsSectionProps {
  readonly summary: DashboardSummary;
}

export function DashboardChartsSection({ summary }: DashboardChartsSectionProps): React.JSX.Element {
  return <DashboardCharts summary={summary} />;
}
