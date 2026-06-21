"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { updateSystemSettingsAction } from "@/actions/settings/updateSystemSettings";
import { FormField } from "@/components/forms/FormField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SettingsFormFooter } from "@/features/settings/components/SettingsFormFooter";
import { systemSettingsSchema, type SystemSettingsValues } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export interface SystemSettingsFormProps {
  readonly defaultValues: SystemSettingsValues;
}

const initialState: ServerActionResult<SettingsMutationResult> | null = null;

export function SystemSettingsForm({ defaultValues }: SystemSettingsFormProps): React.JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateSystemSettingsAction, initialState);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SystemSettingsValues>({
    resolver: zodResolver(systemSettingsSchema) as Resolver<SystemSettingsValues>,
    defaultValues,
  });

  const allowCustomScripts = watch("allowCustomScripts");

  useEffect(() => {
    if (state?.success) {
      toast.success("System settings saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("maintenanceMode", String(values.maintenanceMode));
    formData.set("debugMode", String(values.debugMode));
    formData.set("cacheEnabled", String(values.cacheEnabled));
    formData.set("seoAutomationEnabled", String(values.seoAutomationEnabled));
    formData.set("autoGenerateSchemas", String(values.autoGenerateSchemas));
    formData.set("autoGenerateMetadata", String(values.autoGenerateMetadata));
    formData.set("allowCustomScripts", String(values.allowCustomScripts));
    formData.set("headScripts", values.headScripts ?? "");
    formData.set("bodyScripts", values.bodyScripts ?? "");
    formData.set("footerScripts", values.footerScripts ?? "");
    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">System flags</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {[
            { key: "maintenanceMode" as const, label: "Maintenance mode" },
            { key: "debugMode" as const, label: "Debug mode" },
            { key: "cacheEnabled" as const, label: "Cache enabled" },
            { key: "seoAutomationEnabled" as const, label: "SEO automation" },
            { key: "autoGenerateSchemas" as const, label: "Auto-generate schemas" },
            { key: "autoGenerateMetadata" as const, label: "Auto-generate metadata" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-md border px-4 py-3">
              <span className="text-sm font-medium">{item.label}</span>
              <Switch
                checked={watch(item.key)}
                onCheckedChange={(checked) => setValue(item.key, checked, { shouldValidate: true })}
                aria-label={item.label}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Script injection</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Allow custom scripts</p>
              <p className="text-xs text-muted-foreground">Disabled by default for security</p>
            </div>
            <Switch
              checked={allowCustomScripts}
              onCheckedChange={(checked) => setValue("allowCustomScripts", checked, { shouldValidate: true })}
              aria-label="Allow custom scripts"
            />
          </div>

          <FormField id="headScripts" label="Head scripts" error={errors.headScripts?.message}>
            <Textarea
              id="headScripts"
              rows={4}
              className="font-mono text-sm"
              disabled={!allowCustomScripts}
              {...register("headScripts")}
            />
          </FormField>
          <FormField id="bodyScripts" label="Body scripts" error={errors.bodyScripts?.message}>
            <Textarea
              id="bodyScripts"
              rows={4}
              className="font-mono text-sm"
              disabled={!allowCustomScripts}
              {...register("bodyScripts")}
            />
          </FormField>
          <FormField id="footerScripts" label="Footer scripts" error={errors.footerScripts?.message}>
            <Textarea
              id="footerScripts"
              rows={4}
              className="font-mono text-sm"
              disabled={!allowCustomScripts}
              {...register("footerScripts")}
            />
          </FormField>
        </CardContent>
      </Card>

      <SettingsFormFooter isPending={isPending} />
    </form>
  );
}
