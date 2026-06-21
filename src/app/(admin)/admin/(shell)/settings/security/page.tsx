import { getSettingsAction } from "@/actions/settings";
import { PageHeader } from "@/components/navigation/PageHeader";
import { formatIpListInput } from "@/lib/security/ipList";
import { SecurityOverviewPanel } from "@/features/settings/components/SecurityOverviewPanel";
import { SecuritySettingsForm } from "@/features/settings/components/SecuritySettingsForm";

export const metadata = {
  title: "Security",
};

export default async function SecuritySettingsPage(): Promise<React.JSX.Element> {
  const settings = await getSettingsAction();

  return (
    <>
      <PageHeader
        title="Security"
        description="Authentication hardening, sessions, rate limits, audit policy, and IP access"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Security" },
        ]}
      />

      <div className="mt-8 grid max-w-4xl gap-6">
        <SecurityOverviewPanel settings={settings} />
        <SecuritySettingsForm
          defaultValues={{
            securityLevel: settings.securityLevel,
            sessionIdleTimeoutHours: settings.sessionIdleTimeoutHours,
            sessionAbsoluteLifetimeHours: settings.sessionAbsoluteLifetimeHours,
            loginLockoutEnabled: settings.loginLockoutEnabled,
            loginMaxAttempts: settings.loginMaxAttempts,
            loginLockoutWindowMinutes: settings.loginLockoutWindowMinutes,
            rateLimitSettingsPerMinute: settings.rateLimitSettingsPerMinute,
            rateLimitUploadPerMinute: settings.rateLimitUploadPerMinute,
            rateLimitApiPerMinute: settings.rateLimitApiPerMinute,
            rateLimitSearchPerMinute: settings.rateLimitSearchPerMinute,
            rateLimitImportPerMinute: settings.rateLimitImportPerMinute,
            rateLimitExportPerMinute: settings.rateLimitExportPerMinute,
            auditLogLoginEnabled: settings.auditLogLoginEnabled,
            auditLogFailedLoginEnabled: settings.auditLogFailedLoginEnabled,
            auditLogSettingsChangeEnabled: settings.auditLogSettingsChangeEnabled,
            auditLogMediaUploadEnabled: settings.auditLogMediaUploadEnabled,
            auditLogSeoChangeEnabled: settings.auditLogSeoChangeEnabled,
            ipAllowList: formatIpListInput(settings.ipAllowList),
            ipBlockList: formatIpListInput(settings.ipBlockList),
          }}
        />
      </div>
    </>
  );
}
