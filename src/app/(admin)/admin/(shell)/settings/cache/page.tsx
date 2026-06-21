import { getSettingsAction } from "@/actions/settings";
import { PageHeader } from "@/components/navigation/PageHeader";
import { CacheSettingsPanel } from "@/features/settings/components/CacheSettingsPanel";

export const metadata = {
  title: "Cache",
};

export default async function CacheSettingsPage(): Promise<React.JSX.Element> {
  const settings = await getSettingsAction();

  return (
    <>
      <PageHeader
        title="Cache"
        description="Tagged cache policy and manual purge controls"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Cache" },
        ]}
      />

      <div className="mt-8 max-w-4xl">
        <CacheSettingsPanel
          defaultValues={{
            cacheEnabled: settings.cacheEnabled,
            cacheDurationSeconds: settings.cacheDurationSeconds,
            cacheAutoCleanup: settings.cacheAutoCleanup,
          }}
        />
      </div>
    </>
  );
}
