import { getSettingsAction } from "@/actions/settings";
import { PageHeader } from "@/components/navigation/PageHeader";
import { AppearanceSettingsForm } from "@/features/settings/components/AppearanceSettingsForm";

export const metadata = {
  title: "Appearance Settings",
};

export default async function AppearanceSettingsPage(): Promise<React.JSX.Element> {
  const settings = await getSettingsAction();

  return (
    <>
      <PageHeader
        title="Appearance"
        description="Admin UI theme and layout preferences"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Appearance" },
        ]}
      />

      <div className="mt-8 max-w-4xl">
        <AppearanceSettingsForm
          defaultValues={{
            theme: settings.theme,
            primaryColor: settings.primaryColor,
            borderRadius: settings.borderRadius,
            layoutDensity: settings.layoutDensity,
          }}
        />
      </div>
    </>
  );
}
