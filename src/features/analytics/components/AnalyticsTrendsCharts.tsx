"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ANALYTICS_DATE_RANGE_LABELS } from "@/constants/analytics";

import type { AnalyticsSummary } from "@/types/analytics";

export interface AnalyticsTrendsChartsProps {
  readonly summary: AnalyticsSummary;
}

function formatChartDate(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("uk-UA", { month: "short", day: "numeric" }).format(date);
}

export function AnalyticsTrendsCharts({ summary }: AnalyticsTrendsChartsProps): React.JSX.Element {
  const rangeLabel = ANALYTICS_DATE_RANGE_LABELS[summary.dateRange];

  const seoData = summary.seoScoreTrend.map((point) => ({
    ...point,
    label: formatChartDate(point.date),
  }));

  const publishedData = summary.publishedTrend.map((point) => ({
    ...point,
    label: formatChartDate(point.date),
  }));

  const historyData = summary.historyActivityTrend.map((point) => ({
    ...point,
    label: formatChartDate(point.date),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trends</CardTitle>
        <CardDescription>SEO score, publishing, and content changes — {rangeLabel.toLowerCase()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="history">
          <TabsList>
            <TabsTrigger value="history">Content changes</TabsTrigger>
            <TabsTrigger value="seo">SEO score</TabsTrigger>
            <TabsTrigger value="published">Published products</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4 h-64">
            {historyData.length === 0 ? (
              <EmptyState
                title="No activity in this period"
                description="History events will appear as content is edited."
                className="h-full"
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Changes" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

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
