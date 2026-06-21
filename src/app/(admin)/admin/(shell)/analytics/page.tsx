import { Suspense } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

import { getAnalyticsSummaryAction } from "@/actions/analytics";
import { PageHeader } from "@/components/navigation/PageHeader";
import { ActivitySummaryCard } from "@/features/analytics/components/ActivitySummaryCard";
import { AnalyticsDateRangeFilter } from "@/features/analytics/components/AnalyticsDateRangeFilter";
import { AnalyticsKpiGrid } from "@/features/analytics/components/AnalyticsKpiGrid";
import { AnalyticsTrendsSection } from "@/features/analytics/components/AnalyticsTrendsSection";
import { EntityStatusChart } from "@/features/analytics/components/EntityStatusChart";
import { MediaHealthCard } from "@/features/analytics/components/MediaHealthCard";
import { SeoCoverageCard } from "@/features/analytics/components/SeoCoverageCard";
import { ContentQualityWidget } from "@/features/dashboard/components/ContentQualityWidget";
import { RecentActivityFeed } from "@/features/dashboard/components/RecentActivityFeed";
import { SeoHealthHero } from "@/features/dashboard/components/SeoHealthHero";

export const metadata = {
  title: "Analytics",
};

interface AnalyticsPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const summary = await getAnalyticsSummaryAction(params);
  const generatedLabel = format(summary.generatedAt, "d MMM yyyy, HH:mm", { locale: uk });

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Analytics"
        description={`Business intelligence overview · Updated ${generatedLabel}`}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Analytics" }]}
        actions={
          <Suspense fallback={<div className="h-10 w-[180px] animate-pulse rounded-md bg-muted" />}>
            <AnalyticsDateRangeFilter />
          </Suspense>
        }
      />

      <div className="mt-8 space-y-8">
        <section aria-label="Executive KPI overview">
          <AnalyticsKpiGrid summary={summary} />
        </section>

        <section aria-label="SEO health overview">
          <SeoHealthHero health={summary.seoHealth} />
        </section>

        <EntityStatusChart data={summary.entityStatusBreakdown} />

        <div className="grid gap-6 lg:grid-cols-2">
          <MediaHealthCard media={summary.media} />
          <ActivitySummaryCard activity={summary.activity} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SeoCoverageCard items={summary.seoCoverage} />
          <ContentQualityWidget quality={summary.contentQuality} />
        </div>

        <AnalyticsTrendsSection summary={summary} />

        <RecentActivityFeed items={summary.recentActivity} />
      </div>
    </div>
  );
}
