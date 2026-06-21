"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateNotificationSettingsAction } from "@/actions/notifications";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { notificationSettingsSchema, type NotificationSettingsValues } from "@/schemas/notifications/notificationSchemas";

import type { ServerActionResult } from "@/types";
import type { NotificationSettings } from "@/types/notifications";

export interface NotificationSettingsFormProps {
  readonly defaultValues: NotificationSettingsValues;
}

const initialState: ServerActionResult<NotificationSettings> | null = null;

export function NotificationSettingsForm({
  defaultValues,
}: NotificationSettingsFormProps): React.JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateNotificationSettingsAction, initialState);

  const { handleSubmit, setValue, watch } = useForm<NotificationSettingsValues>({
    defaultValues,
  });

  useEffect(() => {
    if (state?.success) {
      toast.success("Notification settings saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onSubmit = handleSubmit((values) => {
    const parsed = notificationSettingsSchema.safeParse(values);

    if (!parsed.success) {
      toast.error("Invalid notification settings");
      return;
    }

    const formData = new FormData();
    formData.set("emailEnabled", String(parsed.data.emailEnabled));
    formData.set("pushEnabled", String(parsed.data.pushEnabled));
    formData.set("seoAlertsEnabled", String(parsed.data.seoAlertsEnabled));
    formData.set("systemAlertsEnabled", String(parsed.data.systemAlertsEnabled));
    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField id="emailEnabled" label="Email notifications">
            <Switch
              id="emailEnabled"
              checked={watch("emailEnabled")}
              onCheckedChange={(checked) => setValue("emailEnabled", checked, { shouldValidate: true })}
              aria-label="Email notifications"
            />
          </FormField>

          <FormField id="pushEnabled" label="Push notifications">
            <Switch
              id="pushEnabled"
              checked={watch("pushEnabled")}
              onCheckedChange={(checked) => setValue("pushEnabled", checked, { shouldValidate: true })}
              aria-label="Push notifications"
            />
          </FormField>

          <FormField id="seoAlertsEnabled" label="SEO alerts">
            <Switch
              id="seoAlertsEnabled"
              checked={watch("seoAlertsEnabled")}
              onCheckedChange={(checked) =>
                setValue("seoAlertsEnabled", checked, { shouldValidate: true })
              }
              aria-label="SEO alerts"
            />
          </FormField>

          <FormField id="systemAlertsEnabled" label="System alerts">
            <Switch
              id="systemAlertsEnabled"
              checked={watch("systemAlertsEnabled")}
              onCheckedChange={(checked) =>
                setValue("systemAlertsEnabled", checked, { shouldValidate: true })
              }
              aria-label="System alerts"
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save preferences
        </Button>
      </div>
    </form>
  );
}
