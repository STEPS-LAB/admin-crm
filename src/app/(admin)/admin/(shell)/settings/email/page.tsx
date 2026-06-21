import { getSettingsAction } from "@/actions/settings";
import { PageHeader } from "@/components/navigation/PageHeader";
import { EmailOverviewPanel } from "@/features/settings/components/EmailOverviewPanel";
import { EmailSettingsForm } from "@/features/settings/components/EmailSettingsForm";

export const metadata = {
  title: "Email",
};

export default async function EmailSettingsPage(): Promise<React.JSX.Element> {
  const settings = await getSettingsAction();

  return (
    <>
      <PageHeader
        title="Email"
        description="SMTP delivery configuration and test messages"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Email" },
        ]}
      />

      <div className="mt-8 grid max-w-4xl gap-6">
        <EmailOverviewPanel
          settings={settings}
          hasStoredPassword={Boolean(settings.smtpPasswordEncrypted)}
        />
        <EmailSettingsForm
          hasStoredPassword={Boolean(settings.smtpPasswordEncrypted)}
          defaultValues={{
            smtpHost: settings.smtpHost,
            smtpPort: settings.smtpPort,
            smtpUsername: settings.smtpUsername,
            smtpEncryption: settings.smtpEncryption,
            emailSenderName: settings.emailSenderName,
            emailSenderAddress: settings.emailSenderAddress,
            emailReplyTo: settings.emailReplyTo,
          }}
        />
      </div>
    </>
  );
}
