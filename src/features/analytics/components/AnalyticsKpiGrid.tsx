import {
  Activity,
  FileText,
  HardDrive,
  Image,
  Package,
  Search,
  Tag,
} from "lucide-react";

import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { formatFileSize } from "@/lib/media/format";

import type { AnalyticsSummary } from "@/types/analytics";

export interface AnalyticsKpiGridProps {
  readonly summary: AnalyticsSummary;
}

export function AnalyticsKpiGrid({ summary }: AnalyticsKpiGridProps): React.JSX.Element {
  const { dashboard, entities, media, activity, seoHealth } = summary;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
      <KpiCard
        title="Products"
        value={dashboard.products.total}
        icon={Package}
        href="/admin/products"
        secondary={`${dashboard.products.published} published`}
      />
      <KpiCard
        title="Pages"
        value={entities.pages.total}
        icon={FileText}
        href="/admin/pages"
        secondary={`${entities.pages.published} published`}
      />
      <KpiCard
        title="Brands"
        value={entities.brands.total}
        icon={Tag}
        href="/admin/brands"
        secondary={`${entities.brands.published} published`}
      />
      <KpiCard
        title="Media"
        value={entities.mediaAssets}
        icon={Image}
        href="/admin/media"
        secondary={`${media.optimizedAssets} optimized`}
      />
      <KpiCard
        title="SEO Score"
        value={seoHealth.overallScore}
        icon={Search}
        href="/admin/seo"
        secondary={`${seoHealth.profileCount} profiles analyzed`}
      />
      <KpiCard
        title="Storage"
        value={formatFileSize(media.totalBytes)}
        icon={HardDrive}
        href="/admin/media"
        secondary={`${media.totalAssets} assets`}
      />
      <KpiCard
        title="Activity today"
        value={activity.historyEventsToday}
        icon={Activity}
        href="/admin/audit"
        secondary={`${activity.auditEventsToday} security events`}
      />
      <KpiCard
        title="SEO profiles"
        value={dashboard.seo.profiles}
        icon={Search}
        href="/admin/seo/profiles"
        secondary={`${dashboard.seo.redirects} redirects`}
      />
    </div>
  );
}
