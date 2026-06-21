"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { updateGeneralSettingsAction } from "@/actions/settings/updateGeneralSettings";
import { FormField } from "@/components/forms/FormField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SettingsFormFooter } from "@/features/settings/components/SettingsFormFooter";
import { generalSettingsSchema, type GeneralSettingsValues } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export interface GeneralSettingsFormProps {
  readonly defaultValues: GeneralSettingsValues;
}

const initialState: ServerActionResult<SettingsMutationResult> | null = null;

export function GeneralSettingsForm({ defaultValues }: GeneralSettingsFormProps): React.JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateGeneralSettingsAction, initialState);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema) as Resolver<GeneralSettingsValues>,
    defaultValues,
  });

  useEffect(() => {
    if (state?.success) {
      toast.success("General settings saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("siteName", values.siteName);
    formData.set("siteDescription", values.siteDescription ?? "");
    formData.set("siteUrl", values.siteUrl);
    formData.set("logoUrl", values.logoUrl ?? "");
    formData.set("faviconUrl", values.faviconUrl ?? "");
    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Site information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField id="siteName" label="Website name" error={errors.siteName?.message} required>
            <Input id="siteName" {...register("siteName")} />
          </FormField>

          <FormField id="siteUrl" label="Website URL" error={errors.siteUrl?.message} required>
            <Input id="siteUrl" type="url" {...register("siteUrl")} />
          </FormField>

          <div className="md:col-span-2">
            <FormField id="siteDescription" label="Description" error={errors.siteDescription?.message}>
              <Textarea id="siteDescription" rows={3} {...register("siteDescription")} />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField id="logoUrl" label="Logo URL" error={errors.logoUrl?.message}>
            <Input id="logoUrl" type="url" {...register("logoUrl")} />
          </FormField>
          <FormField id="faviconUrl" label="Favicon URL" error={errors.faviconUrl?.message}>
            <Input id="faviconUrl" type="url" {...register("faviconUrl")} />
          </FormField>
        </CardContent>
      </Card>

      <SettingsFormFooter isPending={isPending} />
    </form>
  );
}
