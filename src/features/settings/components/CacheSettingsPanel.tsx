"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { clearCacheAction } from "@/actions/settings/clearCache";
import { updateCacheSettingsAction } from "@/actions/settings/updateCacheSettings";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  CACHE_DURATION_LIMITS,
  CACHE_SCOPE_LABELS,
  CACHE_SCOPES,
  type CacheScope,
} from "@/constants/cache";
import { SettingsFormFooter } from "@/features/settings/components/SettingsFormFooter";
import {
  cacheSettingsSchema,
  type CacheSettingsValues,
} from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export interface CacheSettingsPanelProps {
  readonly defaultValues: CacheSettingsValues;
}

const initialState: ServerActionResult<SettingsMutationResult> | null = null;

export function CacheSettingsPanel({
  defaultValues,
}: CacheSettingsPanelProps): React.JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateCacheSettingsAction, initialState);
  const [clearingScope, startClear] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CacheSettingsValues>({
    resolver: zodResolver(cacheSettingsSchema),
    defaultValues,
  });

  useEffect(() => {
    if (state?.success) {
      toast.success("Cache settings saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("cacheEnabled", String(values.cacheEnabled));
    formData.set("cacheDurationSeconds", String(values.cacheDurationSeconds));
    formData.set("cacheAutoCleanup", String(values.cacheAutoCleanup));
    formAction(formData);
  });

  const runClear = (scope: CacheScope): void => {
    startClear(async () => {
      const result = await clearCacheAction(scope);

      if (result.success) {
        toast.success(`Cleared ${CACHE_SCOPE_LABELS[scope].toLowerCase()} cache`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cache policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Cache enabled</p>
                <p className="text-xs text-muted-foreground">Allow tagged server-side caching</p>
              </div>
              <Switch
                checked={watch("cacheEnabled")}
                onCheckedChange={(checked) =>
                  setValue("cacheEnabled", checked, { shouldValidate: true })
                }
                aria-label="Cache enabled"
              />
            </div>

            <FormField
              id="cacheDurationSeconds"
              label="Default duration (seconds)"
              error={errors.cacheDurationSeconds?.message}
              description={`${CACHE_DURATION_LIMITS.minSeconds}–${CACHE_DURATION_LIMITS.maxSeconds}`}
            >
              <Input
                type="number"
                min={CACHE_DURATION_LIMITS.minSeconds}
                max={CACHE_DURATION_LIMITS.maxSeconds}
                {...register("cacheDurationSeconds", { valueAsNumber: true })}
              />
            </FormField>

            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Automatic cleanup</p>
                <p className="text-xs text-muted-foreground">Expire stale cache entries on schedule</p>
              </div>
              <Switch
                checked={watch("cacheAutoCleanup")}
                onCheckedChange={(checked) =>
                  setValue("cacheAutoCleanup", checked, { shouldValidate: true })
                }
                aria-label="Automatic cleanup"
              />
            </div>
          </CardContent>
        </Card>

        <SettingsFormFooter isPending={isPending} />
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manual cache purge</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {CACHE_SCOPES.map((scope) => (
            <Button
              key={scope}
              type="button"
              variant="outline"
              className="justify-start"
              disabled={clearingScope}
              onClick={() => runClear(scope)}
            >
              {clearingScope ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Clear {CACHE_SCOPE_LABELS[scope]}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
