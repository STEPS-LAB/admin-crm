"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { EntityStatusBreakdown } from "@/types/analytics";

export interface EntityStatusChartProps {
  readonly data: EntityStatusBreakdown[];
}

export function EntityStatusChart({ data }: EntityStatusChartProps): React.JSX.Element {
  const chartData = data.map((item) => ({
    name: item.label,
    Published: item.published,
    Draft: item.draft,
    Archived: item.archived,
    Hidden: item.hidden,
  }));

  const hasData = data.some((item) => item.total > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Content by status</CardTitle>
        <CardDescription>Published, draft, archived, and hidden entities across modules</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        {!hasData ? (
          <EmptyState
            title="No content yet"
            description="Create products, pages, or brands to see status distribution."
            className="h-full"
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Published" stackId="status" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Draft" stackId="status" fill="hsl(var(--chart-2))" />
              <Bar dataKey="Archived" stackId="status" fill="hsl(var(--chart-3))" />
              <Bar dataKey="Hidden" stackId="status" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
