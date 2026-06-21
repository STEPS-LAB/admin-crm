import { Suspense } from "react";

import { getPluginOverviewAction, listPluginsAction } from "@/actions/plugins";
import { PageHeader } from "@/components/navigation/PageHeader";
import { PluginArchitecturePanel } from "@/features/plugins/components/PluginArchitecturePanel";
import { PluginFilters } from "@/features/plugins/components/PluginFilters";
import { PluginGrid } from "@/features/plugins/components/PluginGrid";
import { PluginOverviewStats } from "@/features/plugins/components/PluginOverviewStats";

export const metadata = {
  title: "Plugins",
};

interface PluginsPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PluginsPage({
  searchParams,
}: PluginsPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const [overview, plugins] = await Promise.all([
    getPluginOverviewAction(),
    listPluginsAction(params),
  ]);

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="Plugins"
        description="Bundled modules, optional extensions, and prepared marketplace integrations"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Plugins" }]}
      />

      <div className="mt-8 space-y-8">
        <PluginOverviewStats overview={overview} />

        <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
          <PluginFilters />
        </Suspense>

        <PluginGrid items={plugins} />
        <PluginArchitecturePanel />
      </div>
    </div>
  );
}
