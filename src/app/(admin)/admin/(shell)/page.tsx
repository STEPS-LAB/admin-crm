import { getDashboardSummaryAction } from "@/actions/dashboard/getDashboardSummary";
import { PageHeader } from "@/components/navigation/PageHeader";
import { CatalogSummaryCard } from "@/features/dashboard/components/CatalogSummaryCard";
import { ContentQualityWidget } from "@/features/dashboard/components/ContentQualityWidget";
import { DashboardChartsSection } from "@/features/dashboard/components/DashboardChartsSection";
import { DashboardKpiGrid } from "@/features/dashboard/components/DashboardKpiGrid";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { RecentActivityFeed } from "@/features/dashboard/components/RecentActivityFeed";
import { DashboardRealtimeRefresh } from "@/features/dashboard/components/DashboardRealtimeRefresh";
import { SeoHealthHero } from "@/features/dashboard/components/SeoHealthHero";
import { SeoHealthMetrics } from "@/features/dashboard/components/SeoHealthMetrics";
import { SeoIssuesSummary } from "@/features/dashboard/components/SeoIssuesSummary";

export const metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage(): Promise<React.JSX.Element> {
  const summary = await getDashboardSummaryAction();

  return (
    <div className="mx-auto max-w-[1600px]">
      <DashboardRealtimeRefresh />
      <PageHeader
        title="Dashboard"
        description="Operational command center for SEO health, catalog status, and recent activity."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]}
      />

      <div className="mt-8 space-y-8">
        <section aria-label="SEO health overview">
          <SeoHealthHero health={summary.seoHealth} />
        </section>

        <DashboardKpiGrid summary={summary} />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <SeoHealthMetrics health={summary.seoHealth} />
          </div>
          <SeoIssuesSummary health={summary.seoHealth} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CatalogSummaryCard summary={summary} />
          <ContentQualityWidget quality={summary.contentQuality} />
        </div>

        <DashboardChartsSection summary={summary} />

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentActivityFeed items={summary.recentActivity} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
