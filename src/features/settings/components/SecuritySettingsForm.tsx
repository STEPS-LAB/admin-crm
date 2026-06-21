"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateSecuritySettingsAction } from "@/actions/settings/updateSecuritySettings";
import { FormField } from "@/components/forms/FormField";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  SECURITY_LEVEL_DESCRIPTIONS,
  SECURITY_LEVEL_LABELS,
  SECURITY_LEVEL_PRESETS,
  SECURITY_LEVELS,
} from "@/constants/security-settings";
import { SettingsFormFooter } from "@/features/settings/components/SettingsFormFooter";
import {
  securitySettingsFormSchema,
  type SecuritySettingsFormValues,
} from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export interface SecuritySettingsFormProps {
  readonly defaultValues: SecuritySettingsFormValues;
}

const initialState: ServerActionResult<SettingsMutationResult> | null = null;

export function SecuritySettingsForm({
  defaultValues,
}: SecuritySettingsFormProps): React.JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateSecuritySettingsAction, initialState);

  const form = useForm<SecuritySettingsFormValues>({
    resolver: zodResolver(securitySettingsFormSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const securityLevel = watch("securityLevel");
  const loginLockoutEnabled = watch("loginLockoutEnabled");

  useEffect(() => {
    if (state?.success) {
      toast.success("Security settings saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const applyLevelPreset = (): void => {
    const preset = SECURITY_LEVEL_PRESETS[securityLevel];
    setValue("sessionIdleTimeoutHours", preset.sessionIdleTimeoutHours, { shouldValidate: true });
    setValue("sessionAbsoluteLifetimeHours", preset.sessionAbsoluteLifetimeHours, {
      shouldValidate: true,
    });
    setValue("loginMaxAttempts", preset.loginMaxAttempts, { shouldValidate: true });
    setValue("loginLockoutWindowMinutes", preset.loginLockoutWindowMinutes, {
      shouldValidate: true,
    });
    setValue("loginLockoutEnabled", preset.loginLockoutEnabled, { shouldValidate: true });
    setValue("rateLimitSettingsPerMinute", preset.rateLimitSettingsPerMinute, {
      shouldValidate: true,
    });
    setValue("rateLimitUploadPerMinute", preset.rateLimitUploadPerMinute, { shouldValidate: true });
    setValue("rateLimitApiPerMinute", preset.rateLimitApiPerMinute, { shouldValidate: true });
    setValue("rateLimitSearchPerMinute", preset.rateLimitSearchPerMinute, { shouldValidate: true });
    setValue("rateLimitImportPerMinute", preset.rateLimitImportPerMinute, { shouldValidate: true });
    setValue("rateLimitExportPerMinute", preset.rateLimitExportPerMinute, { shouldValidate: true });
    toast.message(`Applied ${SECURITY_LEVEL_LABELS[securityLevel]} recommended values`);
  };

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("securityLevel", values.securityLevel);
    formData.set("sessionIdleTimeoutHours", String(values.sessionIdleTimeoutHours));
    formData.set("sessionAbsoluteLifetimeHours", String(values.sessionAbsoluteLifetimeHours));
    formData.set("loginLockoutEnabled", String(values.loginLockoutEnabled));
    formData.set("loginMaxAttempts", String(values.loginMaxAttempts));
    formData.set("loginLockoutWindowMinutes", String(values.loginLockoutWindowMinutes));
    formData.set("rateLimitSettingsPerMinute", String(values.rateLimitSettingsPerMinute));
    formData.set("rateLimitUploadPerMinute", String(values.rateLimitUploadPerMinute));
    formData.set("rateLimitApiPerMinute", String(values.rateLimitApiPerMinute));
    formData.set("rateLimitSearchPerMinute", String(values.rateLimitSearchPerMinute));
    formData.set("rateLimitImportPerMinute", String(values.rateLimitImportPerMinute));
    formData.set("rateLimitExportPerMinute", String(values.rateLimitExportPerMinute));
    formData.set("auditLogLoginEnabled", String(values.auditLogLoginEnabled));
    formData.set("auditLogFailedLoginEnabled", String(values.auditLogFailedLoginEnabled));
    formData.set("auditLogSettingsChangeEnabled", String(values.auditLogSettingsChangeEnabled));
    formData.set("auditLogMediaUploadEnabled", String(values.auditLogMediaUploadEnabled));
    formData.set("auditLogSeoChangeEnabled", String(values.auditLogSeoChangeEnabled));
    formData.set("ipAllowList", values.ipAllowList);
    formData.set("ipBlockList", values.ipBlockList);
    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Security level</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {SECURITY_LEVEL_DESCRIPTIONS[securityLevel]}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={applyLevelPreset}>
            Apply recommended values
          </Button>
        </CardHeader>
        <CardContent>
          <FormField id="securityLevel" label="Policy profile" error={errors.securityLevel?.message}>
            <Select
              value={securityLevel}
              onValueChange={(value) =>
                setValue("securityLevel", value as SecuritySettingsFormValues["securityLevel"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="securityLevel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECURITY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {SECURITY_LEVEL_LABELS[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session policy</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField
            id="sessionIdleTimeoutHours"
            label="Idle timeout (hours)"
            error={errors.sessionIdleTimeoutHours?.message}
          >
            <Input
              id="sessionIdleTimeoutHours"
              type="number"
              min={1}
              max={72}
              value={watch("sessionIdleTimeoutHours")}
              onChange={(event) =>
                setValue("sessionIdleTimeoutHours", Number(event.target.value), {
                  shouldValidate: true,
                })
              }
            />
          </FormField>
          <FormField
            id="sessionAbsoluteLifetimeHours"
            label="Absolute lifetime (hours)"
            error={errors.sessionAbsoluteLifetimeHours?.message}
          >
            <Input
              id="sessionAbsoluteLifetimeHours"
              type="number"
              min={1}
              max={168}
              value={watch("sessionAbsoluteLifetimeHours")}
              onChange={(event) =>
                setValue("sessionAbsoluteLifetimeHours", Number(event.target.value), {
                  shouldValidate: true,
                })
              }
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Login protection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Failed login lockout</p>
              <p className="text-sm text-muted-foreground">
                Temporarily block repeated authentication attempts per IP and email.
              </p>
            </div>
            <Switch
              checked={loginLockoutEnabled}
              onCheckedChange={(checked) =>
                setValue("loginLockoutEnabled", checked, { shouldValidate: true })
              }
              aria-label="Failed login lockout"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              id="loginMaxAttempts"
              label="Max attempts"
              error={errors.loginMaxAttempts?.message}
            >
              <Input
                id="loginMaxAttempts"
                type="number"
                min={3}
                max={20}
                disabled={!loginLockoutEnabled}
                value={watch("loginMaxAttempts")}
                onChange={(event) =>
                  setValue("loginMaxAttempts", Number(event.target.value), { shouldValidate: true })
                }
              />
            </FormField>
            <FormField
              id="loginLockoutWindowMinutes"
              label="Lockout window (minutes)"
              error={errors.loginLockoutWindowMinutes?.message}
            >
              <Input
                id="loginLockoutWindowMinutes"
                type="number"
                min={5}
                max={120}
                disabled={!loginLockoutEnabled}
                value={watch("loginLockoutWindowMinutes")}
                onChange={(event) =>
                  setValue("loginLockoutWindowMinutes", Number(event.target.value), {
                    shouldValidate: true,
                  })
                }
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rate limits</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField
            id="rateLimitSettingsPerMinute"
            label="Settings saves per minute"
            error={errors.rateLimitSettingsPerMinute?.message}
          >
            <Input
              id="rateLimitSettingsPerMinute"
              type="number"
              min={5}
              max={120}
              value={watch("rateLimitSettingsPerMinute")}
              onChange={(event) =>
                setValue("rateLimitSettingsPerMinute", Number(event.target.value), {
                  shouldValidate: true,
                })
              }
            />
          </FormField>
          <FormField
            id="rateLimitUploadPerMinute"
            label="Media uploads per minute"
            error={errors.rateLimitUploadPerMinute?.message}
          >
            <Input
              id="rateLimitUploadPerMinute"
              type="number"
              min={5}
              max={120}
              value={watch("rateLimitUploadPerMinute")}
              onChange={(event) =>
                setValue("rateLimitUploadPerMinute", Number(event.target.value), {
                  shouldValidate: true,
                })
              }
            />
          </FormField>
          <FormField
            id="rateLimitApiPerMinute"
            label="Public API requests per minute"
            error={errors.rateLimitApiPerMinute?.message}
          >
            <Input
              id="rateLimitApiPerMinute"
              type="number"
              min={10}
              max={1000}
              value={watch("rateLimitApiPerMinute")}
              onChange={(event) =>
                setValue("rateLimitApiPerMinute", Number(event.target.value), {
                  shouldValidate: true,
                })
              }
            />
          </FormField>
          <FormField
            id="rateLimitSearchPerMinute"
            label="Admin search requests per minute"
            error={errors.rateLimitSearchPerMinute?.message}
          >
            <Input
              id="rateLimitSearchPerMinute"
              type="number"
              min={10}
              max={300}
              value={watch("rateLimitSearchPerMinute")}
              onChange={(event) =>
                setValue("rateLimitSearchPerMinute", Number(event.target.value), {
                  shouldValidate: true,
                })
              }
            />
          </FormField>
          <FormField
            id="rateLimitImportPerMinute"
            label="Import operations per minute"
            error={errors.rateLimitImportPerMinute?.message}
          >
            <Input
              id="rateLimitImportPerMinute"
              type="number"
              min={1}
              max={60}
              value={watch("rateLimitImportPerMinute")}
              onChange={(event) =>
                setValue("rateLimitImportPerMinute", Number(event.target.value), {
                  shouldValidate: true,
                })
              }
            />
          </FormField>
          <FormField
            id="rateLimitExportPerMinute"
            label="Export operations per minute"
            error={errors.rateLimitExportPerMinute?.message}
          >
            <Input
              id="rateLimitExportPerMinute"
              type="number"
              min={1}
              max={60}
              value={watch("rateLimitExportPerMinute")}
              onChange={(event) =>
                setValue("rateLimitExportPerMinute", Number(event.target.value), {
                  shouldValidate: true,
                })
              }
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit logging</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(
            [
              ["auditLogLoginEnabled", "Successful logins"],
              ["auditLogFailedLoginEnabled", "Failed logins"],
              ["auditLogSettingsChangeEnabled", "Settings changes"],
              ["auditLogMediaUploadEnabled", "Media uploads"],
              ["auditLogSeoChangeEnabled", "SEO changes"],
            ] as const
          ).map(([field, label]) => (
            <div
              key={field}
              className="flex items-center justify-between gap-4 rounded-lg border p-4"
            >
              <span className="text-sm font-medium">{label}</span>
              <Switch
                checked={watch(field)}
                onCheckedChange={(checked) => setValue(field, checked, { shouldValidate: true })}
                aria-label={label}
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Media and SEO audit hooks are stored now and enforced as modules adopt the policy.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">IP access control</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField
            id="ipAllowList"
            label="Allow list"
            error={errors.ipAllowList?.message}
            description="One IP per line. Leave empty to allow all non-blocked addresses."
          >
            <Textarea
              id="ipAllowList"
              rows={5}
              value={watch("ipAllowList")}
              onChange={(event) =>
                setValue("ipAllowList", event.target.value, { shouldValidate: true })
              }
              placeholder={"203.0.113.10\n198.51.100.4"}
            />
          </FormField>
          <FormField
            id="ipBlockList"
            label="Block list"
            error={errors.ipBlockList?.message}
            description="Blocked IPs are denied before authentication."
          >
            <Textarea
              id="ipBlockList"
              rows={5}
              value={watch("ipBlockList")}
              onChange={(event) =>
                setValue("ipBlockList", event.target.value, { shouldValidate: true })
              }
              placeholder={"192.0.2.44"}
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">CSRF protected server actions</Badge>
        <Badge variant="outline">HTTP-only secure cookies</Badge>
        <Badge variant="outline">Rich text sanitization</Badge>
      </div>

      <SettingsFormFooter isPending={isPending} />
    </form>
  );
}
