import { FolderTree, GitBranch, Layers, Package, Search } from "lucide-react";

import { KpiCard } from "./KpiCard";

import type { DashboardSummary } from "@/types/dashboard";

export interface DashboardKpiGridProps {
  readonly summary: DashboardSummary;
}

export function DashboardKpiGrid({ summary }: DashboardKpiGridProps): React.JSX.Element {
  const { products, categories, seo } = summary;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      <KpiCard
        title="Products"
        value={products.total}
        icon={Package}
        href="/admin/products"
        secondary={`${products.published} published · ${products.draft} draft`}
      />
      <KpiCard
        title="Categories"
        value={categories.total}
        icon={FolderTree}
        href="/admin/categories"
        secondary={`${categories.brands} brands`}
      />
      <KpiCard
        title="SEO Profiles"
        value={seo.profiles}
        icon={Search}
        href="/admin/seo"
        secondary="Entity SEO configurations"
      />
      <KpiCard
        title="Redirects"
        value={seo.redirects}
        icon={GitBranch}
        href="/admin/seo"
        secondary="Active redirect rules"
      />
      <KpiCard
        title="Schemas"
        value={seo.schemas}
        icon={Layers}
        href="/admin/seo"
        secondary="Structured data documents"
      />
    </div>
  );
}
