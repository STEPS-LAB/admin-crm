import Link from "next/link";

import { getSeoOverviewAction } from "@/actions/seo";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Button } from "@/components/ui/button";
import { RunSeoAuditButton } from "@/features/seo/components/RunSeoAuditButton";
import { EntityScoresGrid } from "@/features/seo/components/EntityScoresGrid";
import { SeoOverviewStats } from "@/features/seo/components/SeoOverviewStats";
import { SeoIssuesSummary } from "@/features/dashboard/components/SeoIssuesSummary";

import type { SeoHealthSummary } from "@/types/dashboard";

export const metadata = {
  title: "SEO Center",
};

export default async function SeoCenterOverviewPage(): Promise<React.JSX.Element> {
  const overview = await getSeoOverviewAction();

  const health: SeoHealthSummary = {
    overallScore: overview.globalScore,
    metrics: [],
    criticalIssues: overview.criticalIssues,
    warnings: overview.warnings,
    recommendations: overview.recommendations,
    lastScanAt: overview.lastScanAt,
    profileCount: overview.profileCount,
  };

  return (
    <>
      <PageHeader
        title="SEO Center"
        description="Metadata, structured data, redirects, and SEO analysis"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "SEO Center" }]}
        actions={
          <div className="flex gap-2">
            <RunSeoAuditButton />
            <Button variant="outline" asChild>
              <Link href="/admin/seo/profiles">Profiles</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/seo/redirects/new">New redirect</Link>
            </Button>
          </div>
        }
      />

      <div className="space-y-8">
        <SeoOverviewStats overview={overview} />

        <div className="grid gap-6 xl:grid-cols-2">
          <SeoIssuesSummary health={health} />
          <EntityScoresGrid entities={overview.entityScores} />
        </div>
      </div>
    </>
  );
}
