import { getSettingsAction } from "@/actions/settings";
import { PageHeader } from "@/components/navigation/PageHeader";
import { LocalizationSettingsForm } from "@/features/settings/components/LocalizationSettingsForm";
import type { LocalizationSettingsValues } from "@/schemas/settings/settingsSchemas";

export const metadata = {
  title: "Localization",
};

export default async function LocalizationSettingsPage(): Promise<React.JSX.Element> {
  const settings = await getSettingsAction();

  const defaultValues: LocalizationSettingsValues = {
    defaultLanguage: settings.defaultLanguage,
    supportedLanguages: settings.supportedLanguages,
    fallbackLanguage: settings.fallbackLanguage,
    timezone: settings.timezone as LocalizationSettingsValues["timezone"],
    currency: settings.currency as LocalizationSettingsValues["currency"],
    automaticLocaleDetection: settings.automaticLocaleDetection,
    browserLanguageDetection: settings.browserLanguageDetection,
    languageSwitcherEnabled: settings.languageSwitcherEnabled,
    localizedUrlsEnabled: settings.localizedUrlsEnabled,
    rtlSupportEnabled: settings.rtlSupportEnabled,
  };

  return (
    <>
      <PageHeader
        title="Localization"
        description="Languages, regional formatting, locale detection, and URL strategy"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Localization" },
        ]}
      />

      <div className="mt-8 max-w-4xl">
        <LocalizationSettingsForm defaultValues={defaultValues} />
      </div>
    </>
  );
}
