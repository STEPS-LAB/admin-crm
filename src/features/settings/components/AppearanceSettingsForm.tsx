"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { updateAppearanceSettingsAction } from "@/actions/settings/updateAppearanceSettings";
import { FormField } from "@/components/forms/FormField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BORDER_RADIUS_OPTIONS, LAYOUT_DENSITY_OPTIONS, THEME_OPTIONS } from "@/constants/settings";
import { SettingsFormFooter } from "@/features/settings/components/SettingsFormFooter";
import { appearanceSettingsSchema, type AppearanceSettingsValues } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export interface AppearanceSettingsFormProps {
  readonly defaultValues: AppearanceSettingsValues;
}

const initialState: ServerActionResult<SettingsMutationResult> | null = null;

const THEME_LABELS: Record<AppearanceSettingsValues["theme"], string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

const DENSITY_LABELS: Record<AppearanceSettingsValues["layoutDensity"], string> = {
  compact: "Compact",
  comfortable: "Comfortable",
};

export function AppearanceSettingsForm({
  defaultValues,
}: AppearanceSettingsFormProps): React.JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateAppearanceSettingsAction, initialState);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppearanceSettingsValues>({
    resolver: zodResolver(appearanceSettingsSchema) as Resolver<AppearanceSettingsValues>,
    defaultValues,
  });

  useEffect(() => {
    if (state?.success) {
      toast.success("Appearance settings saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("theme", values.theme);
    formData.set("primaryColor", values.primaryColor ?? "");
    formData.set("borderRadius", String(values.borderRadius));
    formData.set("layoutDensity", values.layoutDensity);
    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Admin appearance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField id="theme" label="Default theme" error={errors.theme?.message}>
            <Select
              value={watch("theme")}
              onValueChange={(value) =>
                setValue("theme", value as AppearanceSettingsValues["theme"], { shouldValidate: true })
              }
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEME_OPTIONS.map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {THEME_LABELS[theme]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            id="layoutDensity"
            label="Layout density"
            error={errors.layoutDensity?.message}
          >
            <Select
              value={watch("layoutDensity")}
              onValueChange={(value) =>
                setValue("layoutDensity", value as AppearanceSettingsValues["layoutDensity"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="layoutDensity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LAYOUT_DENSITY_OPTIONS.map((density) => (
                  <SelectItem key={density} value={density}>
                    {DENSITY_LABELS[density]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="primaryColor" label="Primary color" error={errors.primaryColor?.message} description="#RRGGBB">
            <Input id="primaryColor" placeholder="#2563eb" {...register("primaryColor")} />
          </FormField>

          <FormField id="borderRadius" label="Border radius" error={errors.borderRadius?.message}>
            <Select
              value={String(watch("borderRadius"))}
              onValueChange={(value) =>
                setValue("borderRadius", Number(value), { shouldValidate: true })
              }
            >
              <SelectTrigger id="borderRadius">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BORDER_RADIUS_OPTIONS.map((radius) => (
                  <SelectItem key={radius} value={String(radius)}>
                    {radius}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </CardContent>
      </Card>

      <SettingsFormFooter isPending={isPending} />
    </form>
  );
}
