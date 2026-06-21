"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateStorageSettingsAction } from "@/actions/settings/updateStorageSettings";
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
import { Switch } from "@/components/ui/switch";
import {
  IMAGE_COMPRESSION_QUALITY_LIMITS,
  STORAGE_PROVIDER_LABELS,
  STORAGE_PROVIDERS,
  UPLOAD_SIZE_LIMITS,
} from "@/constants/storage-settings";
import { SettingsFormFooter } from "@/features/settings/components/SettingsFormFooter";
import {
  storageSettingsSchema,
  type StorageSettingsValues,
} from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export interface StorageSettingsFormProps {
  readonly defaultValues: StorageSettingsValues;
}

const initialState: ServerActionResult<SettingsMutationResult> | null = null;

export function StorageSettingsForm({
  defaultValues,
}: StorageSettingsFormProps): React.JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateStorageSettingsAction, initialState);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StorageSettingsValues>({
    resolver: zodResolver(storageSettingsSchema),
    defaultValues,
  });

  const imageCompressionEnabled = watch("imageCompressionEnabled");

  useEffect(() => {
    if (state?.success) {
      toast.success("Storage settings saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("storageProvider", values.storageProvider);
    formData.set("maxUploadSizeMb", String(values.maxUploadSizeMb));
    formData.set("imageCompressionEnabled", String(values.imageCompressionEnabled));
    formData.set("imageCompressionQuality", String(values.imageCompressionQuality));
    formData.set("autoWebpConversion", String(values.autoWebpConversion));
    formData.set("duplicateDetectionEnabled", String(values.duplicateDetectionEnabled));
    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Provider & limits</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="storageProvider" label="Storage provider" error={errors.storageProvider?.message}>
            <Select
              value={watch("storageProvider")}
              onValueChange={(value) =>
                setValue("storageProvider", value as StorageSettingsValues["storageProvider"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger aria-label="Storage provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STORAGE_PROVIDERS.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {STORAGE_PROVIDER_LABELS[provider]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            id="maxUploadSizeMb"
            label="Max upload size (MB)"
            error={errors.maxUploadSizeMb?.message}
            description={`${UPLOAD_SIZE_LIMITS.minMb}–${UPLOAD_SIZE_LIMITS.maxMb} MB`}
          >
            <Input
              type="number"
              min={UPLOAD_SIZE_LIMITS.minMb}
              max={UPLOAD_SIZE_LIMITS.maxMb}
              {...register("maxUploadSizeMb", { valueAsNumber: true })}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Image processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Compression on upload</p>
              <p className="text-xs text-muted-foreground">Optimize images when they are uploaded</p>
            </div>
            <Switch
              checked={imageCompressionEnabled}
              onCheckedChange={(checked) =>
                setValue("imageCompressionEnabled", checked, { shouldValidate: true })
              }
              aria-label="Compression on upload"
            />
          </div>

          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Auto WebP conversion</p>
              <p className="text-xs text-muted-foreground">Convert supported images to WebP</p>
            </div>
            <Switch
              checked={watch("autoWebpConversion")}
              onCheckedChange={(checked) =>
                setValue("autoWebpConversion", checked, { shouldValidate: true })
              }
              aria-label="Auto WebP conversion"
              disabled={!imageCompressionEnabled}
            />
          </div>

          <FormField
            id="imageCompressionQuality"
            label="Compression quality"
            error={errors.imageCompressionQuality?.message}
            description={`${IMAGE_COMPRESSION_QUALITY_LIMITS.min}–${IMAGE_COMPRESSION_QUALITY_LIMITS.max}`}
          >
            <Input
              type="number"
              min={IMAGE_COMPRESSION_QUALITY_LIMITS.min}
              max={IMAGE_COMPRESSION_QUALITY_LIMITS.max}
              disabled={!imageCompressionEnabled}
              {...register("imageCompressionQuality", { valueAsNumber: true })}
            />
          </FormField>

          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Duplicate detection</p>
              <p className="text-xs text-muted-foreground">Skip upload when SHA-256 hash already exists</p>
            </div>
            <Switch
              checked={watch("duplicateDetectionEnabled")}
              onCheckedChange={(checked) =>
                setValue("duplicateDetectionEnabled", checked, { shouldValidate: true })
              }
              aria-label="Duplicate detection"
            />
          </div>
        </CardContent>
      </Card>

      <SettingsFormFooter isPending={isPending} />
    </form>
  );
}
