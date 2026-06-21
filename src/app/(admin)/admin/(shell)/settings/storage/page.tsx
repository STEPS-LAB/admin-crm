import { getSettingsAction, getStorageOverviewAction } from "@/actions/settings";
import { PageHeader } from "@/components/navigation/PageHeader";
import { StorageOverviewPanel } from "@/features/settings/components/StorageOverviewPanel";
import { StorageSettingsForm } from "@/features/settings/components/StorageSettingsForm";

export const metadata = {
  title: "Storage",
};

export default async function StorageSettingsPage(): Promise<React.JSX.Element> {
  const [settings, overview] = await Promise.all([getSettingsAction(), getStorageOverviewAction()]);

  return (
    <>
      <PageHeader
        title="Storage"
        description="Upload limits, image compression, and duplicate detection"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Storage" },
        ]}
      />

      <div className="mt-8 grid max-w-4xl gap-6">
        <StorageOverviewPanel overview={overview} />
        <StorageSettingsForm
          defaultValues={{
            storageProvider: settings.storageProvider,
            maxUploadSizeMb: settings.maxUploadSizeMb,
            imageCompressionEnabled: settings.imageCompressionEnabled,
            imageCompressionQuality: settings.imageCompressionQuality,
            autoWebpConversion: settings.autoWebpConversion,
            duplicateDetectionEnabled: settings.duplicateDetectionEnabled,
          }}
        />
      </div>
    </>
  );
}
