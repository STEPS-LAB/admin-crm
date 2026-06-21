"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { DashboardSummary } from "@/types/dashboard";

export interface DashboardChartsProps {
  readonly summary: DashboardSummary;
}

function formatChartDate(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("uk-UA", { month: "short", day: "numeric" }).format(date);
}

export function DashboardCharts({ summary }: DashboardChartsProps): React.JSX.Element {
  const seoData = summary.seoScoreTrend.map((point) => ({
    ...point,
    label: formatChartDate(point.date),
  }));

  const publishedData = summary.publishedTrend.map((point) => ({
    ...point,
    label: formatChartDate(point.date),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trends</CardTitle>
        <CardDescription>SEO score and publishing activity over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="seo">
          <TabsList>
            <TabsTrigger value="seo">SEO score</TabsTrigger>
            <TabsTrigger value="published">Published products</TabsTrigger>
          </TabsList>

          <TabsContent value="seo" className="mt-4 h-64">
            {seoData.length === 0 ? (
              <EmptyState
                title="No SEO trend data"
                description="Score history will appear after analyses run."
                className="h-full"
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seoData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="SEO score"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="published" className="mt-4 h-64">
            {publishedData.length === 0 ? (
              <EmptyState
                title="No publishing activity"
                description="Published products will appear on the timeline."
                className="h-full"
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={publishedData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Published" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
