import Link from "next/link";
import { Activity } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { ActivityAnalyticsSummary } from "@/types/analytics";

export interface ActivitySummaryCardProps {
  readonly activity: ActivityAnalyticsSummary;
}

function ActivityMetric({
  label,
  value,
  href,
}: {
  readonly label: string;
  readonly value: number;
  readonly href?: string;
}): React.JSX.Element {
  const content = (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-colors hover:bg-muted/50 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {content}
      </Link>
    );
  }

  return content;
}

export function ActivitySummaryCard({ activity }: ActivitySummaryCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Today&apos;s activity</CardTitle>
          <CardDescription>Content changes and security events in the last 24 hours</CardDescription>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
          <Activity className="h-[18px] w-[18px] text-muted-foreground" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActivityMetric label="History events" value={activity.historyEventsToday} href="/admin/audit" />
          <ActivityMetric label="Security events" value={activity.auditEventsToday} href="/admin/audit/security" />
          <ActivityMetric label="Product updates" value={activity.productUpdatesToday} href="/admin/products" />
          <ActivityMetric label="SEO changes" value={activity.seoChangesToday} href="/admin/seo" />
          <ActivityMetric label="Media uploads" value={activity.mediaUploadsToday} href="/admin/media" />
        </div>
      </CardContent>
    </Card>
  );
}
