import { getFeatureFlagOverviewAction, listFeatureFlagsAction } from "@/actions/feature-flags";
import { getSettingsAction } from "@/actions/settings";
import { PageHeader } from "@/components/navigation/PageHeader";
import { AdvancedOverviewPanel } from "@/features/settings/components/AdvancedOverviewPanel";
import { AdvancedSettingsForm } from "@/features/settings/components/AdvancedSettingsForm";
import { FeatureFlagsPanel } from "@/features/settings/components/FeatureFlagsPanel";
import { SystemInfoPanel } from "@/features/settings/components/SystemInfoPanel";
import { isProductionEnvironment } from "@/lib/system/developerMode";
import { getSystemInfo } from "@/services/systemInfoService";

export const metadata = {
  title: "Advanced",
};

export default async function AdvancedSettingsPage(): Promise<React.JSX.Element> {
  const [settings, systemInfo, overview, flags] = await Promise.all([
    getSettingsAction(),
    getSystemInfo(),
    getFeatureFlagOverviewAction(),
    listFeatureFlagsAction(),
  ]);

  const isProduction = isProductionEnvironment();

  return (
    <>
      <PageHeader
        title="Advanced"
        description="Developer diagnostics, feature flags, and read-only system metadata"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Advanced" },
        ]}
      />

      <div className="mt-8 grid max-w-4xl gap-6">
        <AdvancedOverviewPanel settings={settings} isProduction={isProduction} />
        <SystemInfoPanel info={systemInfo} />
        <FeatureFlagsPanel overview={overview} flags={flags} />
        <AdvancedSettingsForm
          isProduction={isProduction}
          defaultValues={{
            developerModeEnabled: settings.developerModeEnabled,
            showSqlQueries: settings.showSqlQueries,
            showApiTiming: settings.showApiTiming,
            showServerActions: settings.showServerActions,
            mockDataEnabled: settings.mockDataEnabled,
            testModeEnabled: settings.testModeEnabled,
            developerToolbarEnabled: settings.developerToolbarEnabled,
            verboseLoggingEnabled: settings.verboseLoggingEnabled,
          }}
        />
      </div>
    </>
  );
}
