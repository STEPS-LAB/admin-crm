import { getBackupOverviewAction, getSettingsAction, listBackupRecordsAction } from "@/actions/settings";
import { PageHeader } from "@/components/navigation/PageHeader";
import { BackupCenterPanel } from "@/features/settings/components/BackupCenterPanel";
import { BackupScheduleForm } from "@/features/settings/components/BackupScheduleForm";
import { SystemSettingsForm } from "@/features/settings/components/SystemSettingsForm";

export const metadata = {
  title: "System Settings",
};

export default async function SystemSettingsPage(): Promise<React.JSX.Element> {
  const [settings, backupRecords, overview] = await Promise.all([
    getSettingsAction(),
    listBackupRecordsAction(),
    getBackupOverviewAction(),
  ]);

  return (
    <>
      <PageHeader
        title="System"
        description="Feature flags, automation, backups, and script injection"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings", href: "/admin/settings" },
          { label: "System" },
        ]}
      />

      <div className="mt-8 max-w-4xl space-y-6">
        <BackupCenterPanel overview={overview} records={backupRecords} />
        <BackupScheduleForm
          defaultValues={{
            backupScheduleEnabled: settings.backupScheduleEnabled,
            backupScheduleHourUtc: settings.backupScheduleHourUtc,
            backupRetentionMaxCount: settings.backupRetentionMaxCount,
            backupEncryptionEnabled: settings.backupEncryptionEnabled,
          }}
        />
        <SystemSettingsForm
          defaultValues={{
            maintenanceMode: settings.maintenanceMode,
            debugMode: settings.debugMode,
            cacheEnabled: settings.cacheEnabled,
            seoAutomationEnabled: settings.seoAutomationEnabled,
            autoGenerateSchemas: settings.autoGenerateSchemas,
            autoGenerateMetadata: settings.autoGenerateMetadata,
            allowCustomScripts: settings.allowCustomScripts,
            headScripts: settings.headScripts,
            bodyScripts: settings.bodyScripts,
            footerScripts: settings.footerScripts,
          }}
        />
      </div>
    </>
  );
}
