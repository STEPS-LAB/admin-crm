"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { sendTestEmailAction } from "@/actions/settings/sendTestEmail";
import { updateEmailSettingsAction } from "@/actions/settings/updateEmailSettings";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SMTP_ENCRYPTION_LABELS,
  SMTP_ENCRYPTION_MODES,
  SMTP_PORT_LIMITS,
} from "@/constants/email-settings";
import { SettingsFormFooter } from "@/features/settings/components/SettingsFormFooter";
import {
  emailSettingsFormSchema,
  type EmailSettingsFormValues,
} from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export interface EmailSettingsFormProps {
  readonly defaultValues: EmailSettingsFormValues;
  readonly hasStoredPassword: boolean;
}

const initialState: ServerActionResult<SettingsMutationResult> | null = null;

export function EmailSettingsForm({
  defaultValues,
  hasStoredPassword,
}: EmailSettingsFormProps): React.JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateEmailSettingsAction, initialState);
  const [isSending, startSend] = useTransition();
  const [testRecipient, setTestRecipient] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmailSettingsFormValues>({
    resolver: zodResolver(emailSettingsFormSchema) as Resolver<EmailSettingsFormValues>,
    defaultValues,
  });

  useEffect(() => {
    if (state?.success) {
      toast.success("Email settings saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("smtpHost", values.smtpHost ?? "");
    formData.set("smtpPort", String(values.smtpPort));
    formData.set("smtpUsername", values.smtpUsername ?? "");
    if (values.smtpPassword) {
      formData.set("smtpPassword", values.smtpPassword);
    }
    formData.set("smtpEncryption", values.smtpEncryption);
    formData.set("emailSenderName", values.emailSenderName ?? "");
    formData.set("emailSenderAddress", values.emailSenderAddress ?? "");
    formData.set("emailReplyTo", values.emailReplyTo ?? "");
    formAction(formData);
  });

  const runTestEmail = (): void => {
    startSend(async () => {
      const result = await sendTestEmailAction(testRecipient);

      if (result.success) {
        toast.success(`Test email sent to ${result.data.recipient}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SMTP server</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="smtpHost" label="Host" error={errors.smtpHost?.message}>
            <Input {...register("smtpHost")} placeholder="smtp.example.com" autoComplete="off" />
          </FormField>

          <FormField
            id="smtpPort"
            label="Port"
            error={errors.smtpPort?.message}
            description={`${SMTP_PORT_LIMITS.min}–${SMTP_PORT_LIMITS.max}`}
          >
            <Input
              type="number"
              min={SMTP_PORT_LIMITS.min}
              max={SMTP_PORT_LIMITS.max}
              {...register("smtpPort", { valueAsNumber: true })}
            />
          </FormField>

          <FormField id="smtpUsername" label="Username" error={errors.smtpUsername?.message}>
            <Input {...register("smtpUsername")} autoComplete="off" />
          </FormField>

          <FormField
            id="smtpPassword"
            label="Password"
            error={errors.smtpPassword?.message}
            {...(hasStoredPassword
              ? { description: "Leave blank to keep the current password" }
              : {})}
          >
            <Input type="password" {...register("smtpPassword")} autoComplete="new-password" />
          </FormField>

          <FormField id="smtpEncryption" label="Encryption" error={errors.smtpEncryption?.message}>
            <Select
              value={watch("smtpEncryption")}
              onValueChange={(value) =>
                setValue("smtpEncryption", value as EmailSettingsFormValues["smtpEncryption"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger aria-label="SMTP encryption">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SMTP_ENCRYPTION_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {SMTP_ENCRYPTION_LABELS[mode]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sender identity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="emailSenderName" label="Sender name" error={errors.emailSenderName?.message}>
            <Input {...register("emailSenderName")} />
          </FormField>

          <FormField id="emailSenderAddress" label="Sender email" error={errors.emailSenderAddress?.message}>
            <Input type="email" {...register("emailSenderAddress")} />
          </FormField>

          <FormField id="emailReplyTo" label="Reply-to" error={errors.emailReplyTo?.message} className="sm:col-span-2">
            <Input type="email" {...register("emailReplyTo")} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send test email</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <FormField id="testRecipient" label="Recipient" className="flex-1">
            <Input
              type="email"
              value={testRecipient}
              onChange={(event) => setTestRecipient(event.target.value)}
              placeholder="you@example.com"
            />
          </FormField>
          <Button
            type="button"
            variant="outline"
            disabled={isSending || testRecipient.trim().length === 0}
            onClick={runTestEmail}
          >
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
            Send test
          </Button>
        </CardContent>
      </Card>

      <SettingsFormFooter isPending={isPending} />
    </form>
  );
}
