"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { updateAdvancedSettingsAction } from "@/actions/settings/updateAdvancedSettings";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  DEVELOPER_OPTION_DESCRIPTIONS,
  DEVELOPER_OPTION_KEYS,
  DEVELOPER_OPTION_LABELS,
  type DeveloperOptionKey,
} from "@/constants/advanced-settings";
import { SettingsFormFooter } from "@/features/settings/components/SettingsFormFooter";
import {
  advancedSettingsSchema,
  type AdvancedSettingsValues,
} from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export interface AdvancedSettingsFormProps {
  readonly defaultValues: AdvancedSettingsValues;
  readonly isProduction: boolean;
}

const initialState: ServerActionResult<SettingsMutationResult> | null = null;

const DIAGNOSTIC_KEYS = DEVELOPER_OPTION_KEYS.filter(
  (key): key is Exclude<DeveloperOptionKey, "developerModeEnabled"> => key !== "developerModeEnabled",
);

export function AdvancedSettingsForm({
  defaultValues,
  isProduction,
}: AdvancedSettingsFormProps): React.JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateAdvancedSettingsAction, initialState);

  const form = useForm<AdvancedSettingsValues>({
    resolver: zodResolver(advancedSettingsSchema) as Resolver<AdvancedSettingsValues>,
    defaultValues,
  });

  const { handleSubmit, setValue, watch } = form;
  const developerModeEnabled = watch("developerModeEnabled");
  const controlsDisabled = isProduction || isPending;

  useEffect(() => {
    if (state?.success) {
      toast.success("Advanced settings saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();

    for (const key of DEVELOPER_OPTION_KEYS) {
      formData.set(key, String(values[key]));
    }

    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">Developer mode</CardTitle>
            {isProduction ? <Badge variant="warning">Disabled in production</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {DEVELOPER_OPTION_DESCRIPTIONS.developerModeEnabled}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <span className="text-sm font-medium">{DEVELOPER_OPTION_LABELS.developerModeEnabled}</span>
            <Switch
              checked={developerModeEnabled}
              onCheckedChange={(checked) => {
                setValue("developerModeEnabled", checked, { shouldValidate: true });

                if (!checked) {
                  for (const key of DIAGNOSTIC_KEYS) {
                    setValue(key, false, { shouldValidate: true });
                  }
                }
              }}
              disabled={controlsDisabled}
              aria-label={DEVELOPER_OPTION_LABELS.developerModeEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {DIAGNOSTIC_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-start justify-between gap-4 rounded-md border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{DEVELOPER_OPTION_LABELS[key]}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {DEVELOPER_OPTION_DESCRIPTIONS[key]}
                </p>
              </div>
              <Switch
                checked={watch(key)}
                onCheckedChange={(checked) => setValue(key, checked, { shouldValidate: true })}
                disabled={controlsDisabled || !developerModeEnabled}
                aria-label={DEVELOPER_OPTION_LABELS[key]}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <SettingsFormFooter isPending={isPending} />
    </form>
  );
}
