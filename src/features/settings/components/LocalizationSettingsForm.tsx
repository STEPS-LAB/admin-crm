"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { updateLocalizationSettingsAction } from "@/actions/settings/updateLocalizationSettings";
import { FormField } from "@/components/forms/FormField";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  CURRENCY_OPTIONS,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  TIMEZONE_OPTIONS,
} from "@/constants/settings";
import { SettingsFormFooter } from "@/features/settings/components/SettingsFormFooter";
import {
  localizationSettingsSchema,
  type LocalizationSettingsValues,
} from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export interface LocalizationSettingsFormProps {
  readonly defaultValues: LocalizationSettingsValues;
}

const initialState: ServerActionResult<SettingsMutationResult> | null = null;

export function LocalizationSettingsForm({
  defaultValues,
}: LocalizationSettingsFormProps): React.JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateLocalizationSettingsAction,
    initialState,
  );

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LocalizationSettingsValues>({
    resolver: zodResolver(localizationSettingsSchema) as Resolver<LocalizationSettingsValues>,
    defaultValues,
  });

  const supportedLanguages = watch("supportedLanguages");
  const automaticLocaleDetection = watch("automaticLocaleDetection");

  useEffect(() => {
    if (state?.success) {
      toast.success("Localization settings saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const toggleLanguage = (
    language: LocalizationSettingsValues["supportedLanguages"][number],
    checked: boolean,
  ): void => {
    const current = new Set(supportedLanguages);

    if (checked) {
      current.add(language);
    } else {
      current.delete(language);
    }

    setValue("supportedLanguages", [...current] as LocalizationSettingsValues["supportedLanguages"], {
      shouldValidate: true,
    });
  };

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("defaultLanguage", values.defaultLanguage);
    formData.set("supportedLanguages", values.supportedLanguages.join(","));
    formData.set("fallbackLanguage", values.fallbackLanguage);
    formData.set("timezone", values.timezone);
    formData.set("currency", values.currency);
    formData.set("automaticLocaleDetection", String(values.automaticLocaleDetection));
    formData.set("browserLanguageDetection", String(values.browserLanguageDetection));
    formData.set("languageSwitcherEnabled", String(values.languageSwitcherEnabled));
    formData.set("localizedUrlsEnabled", String(values.localizedUrlsEnabled));
    formData.set("rtlSupportEnabled", String(values.rtlSupportEnabled));
    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Languages</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField id="defaultLanguage" label="Default language" error={errors.defaultLanguage?.message}>
            <Select
              value={watch("defaultLanguage")}
              onValueChange={(value) =>
                setValue("defaultLanguage", value as LocalizationSettingsValues["defaultLanguage"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="defaultLanguage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((language) => (
                  <SelectItem key={language} value={language}>
                    {LANGUAGE_LABELS[language]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="fallbackLanguage" label="Fallback language" error={errors.fallbackLanguage?.message}>
            <Select
              value={watch("fallbackLanguage")}
              onValueChange={(value) =>
                setValue("fallbackLanguage", value as LocalizationSettingsValues["fallbackLanguage"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="fallbackLanguage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((language) => (
                  <SelectItem key={language} value={language}>
                    {LANGUAGE_LABELS[language]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <fieldset className="md:col-span-2 space-y-3">
            <legend className="text-sm font-medium">Supported languages</legend>
            {errors.supportedLanguages?.message ? (
              <p className="text-sm text-destructive" role="alert">
                {errors.supportedLanguages.message}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-4">
              {SUPPORTED_LANGUAGES.map((language) => (
                <label key={language} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={supportedLanguages.includes(language)}
                    onCheckedChange={(checked) => toggleLanguage(language, checked === true)}
                    aria-label={LANGUAGE_LABELS[language]}
                  />
                  {LANGUAGE_LABELS[language]}
                </label>
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Regional formatting</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField id="timezone" label="Timezone" error={errors.timezone?.message}>
            <Select
              value={watch("timezone")}
              onValueChange={(value) =>
                setValue("timezone", value as LocalizationSettingsValues["timezone"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((timezone) => (
                  <SelectItem key={timezone} value={timezone}>
                    {timezone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="currency" label="Currency" error={errors.currency?.message}>
            <Select
              value={watch("currency")}
              onValueChange={(value) =>
                setValue("currency", value as LocalizationSettingsValues["currency"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detection &amp; URLs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Automatic locale detection</p>
              <p className="text-sm text-muted-foreground">
                Redirect visitors to their preferred language when no locale is specified.
              </p>
            </div>
            <Switch
              checked={automaticLocaleDetection}
              onCheckedChange={(checked) =>
                setValue("automaticLocaleDetection", checked, { shouldValidate: true })
              }
              aria-label="Automatic locale detection"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Browser language detection</p>
              <p className="text-sm text-muted-foreground">
                Use the Accept-Language header when automatic detection is enabled.
              </p>
            </div>
            <Switch
              checked={watch("browserLanguageDetection")}
              onCheckedChange={(checked) =>
                setValue("browserLanguageDetection", checked, { shouldValidate: true })
              }
              disabled={!automaticLocaleDetection}
              aria-label="Browser language detection"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Public language switcher</p>
              <p className="text-sm text-muted-foreground">
                Show UA/EN toggle in the storefront header.
              </p>
            </div>
            <Switch
              checked={watch("languageSwitcherEnabled")}
              onCheckedChange={(checked) =>
                setValue("languageSwitcherEnabled", checked, { shouldValidate: true })
              }
              aria-label="Public language switcher"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Localized URLs</p>
              <p className="text-sm text-muted-foreground">
                Canonical paths use /{"{lang}"}/ segment structure aligned with the sitemap.
              </p>
            </div>
            <Switch
              checked={watch("localizedUrlsEnabled")}
              onCheckedChange={(checked) =>
                setValue("localizedUrlsEnabled", checked, { shouldValidate: true })
              }
              aria-label="Localized URLs"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">RTL support</p>
              <p className="text-sm text-muted-foreground">
                Prepare layout direction rules for future right-to-left languages.
              </p>
            </div>
            <Switch
              checked={watch("rtlSupportEnabled")}
              onCheckedChange={(checked) =>
                setValue("rtlSupportEnabled", checked, { shouldValidate: true })
              }
              aria-label="RTL support"
            />
          </div>
        </CardContent>
      </Card>

      <SettingsFormFooter isPending={isPending} />
    </form>
  );
}
