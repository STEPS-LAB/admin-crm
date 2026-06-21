"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { updateBackupSettingsAction } from "@/actions/settings/backup";
import { FormField } from "@/components/forms/FormField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SettingsFormFooter } from "@/features/settings/components/SettingsFormFooter";
import {
  backupSettingsSchema,
  type BackupSettingsValues,
} from "@/schemas/settings/settingsSchemas";
import { toast } from "sonner";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export interface BackupScheduleFormProps {
  readonly defaultValues: BackupSettingsValues;
}

const initialState: ServerActionResult<SettingsMutationResult> | null = null;

export function BackupScheduleForm({
  defaultValues,
}: BackupScheduleFormProps): React.JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateBackupSettingsAction, initialState);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BackupSettingsValues>({
    resolver: zodResolver(backupSettingsSchema),
    defaultValues,
  });

  const scheduleEnabled = watch("backupScheduleEnabled");
  const encryptionEnabled = watch("backupEncryptionEnabled");

  useEffect(() => {
    if (state?.success) {
      toast.success("Backup settings saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("backupScheduleEnabled", String(values.backupScheduleEnabled));
    formData.set("backupScheduleHourUtc", String(values.backupScheduleHourUtc));
    formData.set("backupRetentionMaxCount", String(values.backupRetentionMaxCount));
    formData.set("backupEncryptionEnabled", String(values.backupEncryptionEnabled));
    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backup schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Daily scheduled backup</p>
              <p className="text-sm text-muted-foreground">
                Runs a full encrypted backup once per day at the configured UTC hour.
              </p>
            </div>
            <Switch
              checked={scheduleEnabled}
              onCheckedChange={(checked) =>
                setValue("backupScheduleEnabled", checked, { shouldValidate: true })
              }
              aria-label="Daily scheduled backup"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              id="backupScheduleHourUtc"
              label="Schedule hour (UTC)"
              error={errors.backupScheduleHourUtc?.message}
            >
              <Input
                id="backupScheduleHourUtc"
                type="number"
                min={0}
                max={23}
                disabled={!scheduleEnabled}
                value={watch("backupScheduleHourUtc")}
                onChange={(event) =>
                  setValue("backupScheduleHourUtc", Number(event.target.value), {
                    shouldValidate: true,
                  })
                }
              />
            </FormField>

            <FormField
              id="backupRetentionMaxCount"
              label="Retention count"
              error={errors.backupRetentionMaxCount?.message}
            >
              <Input
                id="backupRetentionMaxCount"
                type="number"
                min={5}
                max={365}
                value={watch("backupRetentionMaxCount")}
                onChange={(event) =>
                  setValue("backupRetentionMaxCount", Number(event.target.value), {
                    shouldValidate: true,
                  })
                }
              />
            </FormField>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">AES-256 encryption</p>
              <p className="text-sm text-muted-foreground">
                Encrypt backup archives at rest using BACKUP_ENCRYPTION_KEY.
              </p>
            </div>
            <Switch
              checked={encryptionEnabled}
              onCheckedChange={(checked) =>
                setValue("backupEncryptionEnabled", checked, { shouldValidate: true })
              }
              aria-label="AES-256 encryption"
            />
          </div>
        </CardContent>
      </Card>

      <SettingsFormFooter isPending={isPending} />
    </form>
  );
}
