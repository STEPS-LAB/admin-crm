"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { updateIntegrationsSettingsAction } from "@/actions/settings/updateIntegrationsSettings";
import { FormField } from "@/components/forms/FormField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SettingsFormFooter } from "@/features/settings/components/SettingsFormFooter";
import {
  integrationsSettingsSchema,
  type IntegrationsSettingsValues,
} from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export interface IntegrationsSettingsFormProps {
  readonly defaultValues: IntegrationsSettingsValues;
}

const initialState: ServerActionResult<SettingsMutationResult> | null = null;

export function IntegrationsSettingsForm({
  defaultValues,
}: IntegrationsSettingsFormProps): React.JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateIntegrationsSettingsAction, initialState);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IntegrationsSettingsValues>({
    resolver: zodResolver(integrationsSettingsSchema) as Resolver<IntegrationsSettingsValues>,
    defaultValues,
  });

  useEffect(() => {
    if (state?.success) {
      toast.success("Integration settings saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("googleAnalyticsId", values.googleAnalyticsId ?? "");
    formData.set("googleTagManagerId", values.googleTagManagerId ?? "");
    formData.set("googleSearchConsoleVerification", values.googleSearchConsoleVerification ?? "");
    formData.set("bingWebmasterVerification", values.bingWebmasterVerification ?? "");
    formData.set("facebookPixelId", values.facebookPixelId ?? "");
    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analytics & verification</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField id="googleAnalyticsId" label="Google Analytics ID" error={errors.googleAnalyticsId?.message}>
            <Input id="googleAnalyticsId" placeholder="G-XXXXXXXX" {...register("googleAnalyticsId")} />
          </FormField>
          <FormField id="googleTagManagerId" label="Google Tag Manager ID" error={errors.googleTagManagerId?.message}>
            <Input id="googleTagManagerId" placeholder="GTM-XXXXXXX" {...register("googleTagManagerId")} />
          </FormField>
          <FormField
            id="googleSearchConsoleVerification"
            label="Google Search Console verification"
            error={errors.googleSearchConsoleVerification?.message}
          >
            <Input id="googleSearchConsoleVerification" {...register("googleSearchConsoleVerification")} />
          </FormField>
          <FormField
            id="bingWebmasterVerification"
            label="Bing Webmaster verification"
            error={errors.bingWebmasterVerification?.message}
          >
            <Input id="bingWebmasterVerification" {...register("bingWebmasterVerification")} />
          </FormField>
          <FormField id="facebookPixelId" label="Facebook Pixel ID" error={errors.facebookPixelId?.message}>
            <Input id="facebookPixelId" {...register("facebookPixelId")} />
          </FormField>
        </CardContent>
      </Card>

      <SettingsFormFooter isPending={isPending} />
    </form>
  );
}
