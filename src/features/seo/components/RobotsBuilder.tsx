"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateRobotsAction } from "@/actions/seo/robotsActions";
import { FormField } from "@/components/forms/FormField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { buildRobotsTxt } from "@/lib/seo/robotsTxt";
import { robotsConfigSchema, type RobotsConfigValues } from "@/schemas/seo/robotsSchemas";

import type { ServerActionResult } from "@/types";
import type { RobotsSummary } from "@/types/sitemap-robots";

export interface RobotsBuilderProps {
  readonly summary: RobotsSummary;
}

const initialState: ServerActionResult<RobotsSummary> | null = null;

export function RobotsBuilder({ summary }: RobotsBuilderProps): React.JSX.Element {
  const [state, formAction, isPending] = useActionState(updateRobotsAction, initialState);

  const defaultValues: RobotsConfigValues = {
    userAgent: summary.config?.userAgent ?? "*",
    allowRules: summary.config?.allowRules ?? "/",
    disallowRules: summary.config?.disallowRules ?? "/admin\n/api",
    host: summary.config?.host ?? null,
    sitemapUrls: summary.config?.sitemapUrls ?? [`${summary.siteUrl.replace(/\/+$/, "")}/sitemap.xml`],
    customDirectives: summary.config?.customDirectives ?? null,
    isActive: summary.config?.isActive ?? true,
  };

  const form = useForm<RobotsConfigValues>({
    resolver: zodResolver(robotsConfigSchema),
    defaultValues,
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchedValues = watch();

  const livePreview = useMemo(
    () => buildRobotsTxt(watchedValues, summary.siteUrl),
    [watchedValues, summary.siteUrl],
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("robots.txt saved");
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("userAgent", values.userAgent);
    formData.set("allowRules", values.allowRules ?? "");
    formData.set("disallowRules", values.disallowRules ?? "");
    formData.set("host", values.host ?? "");
    formData.set("sitemapUrls", values.sitemapUrls.join("\n"));
    formData.set("customDirectives", values.customDirectives ?? "");
    formData.set("isActive", values.isActive ? "true" : "false");
    formAction(formData);
  });

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Robots.txt builder</CardTitle>
              <CardDescription>Configure crawl rules without editing raw files manually</CardDescription>
            </div>
            <Badge variant={summary.enabled ? "success" : "secondary"}>
              {summary.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField id="userAgent" label="User-agent" required error={errors.userAgent?.message}>
              <Input id="userAgent" {...register("userAgent")} />
            </FormField>

            <FormField id="allowRules" label="Allow rules" error={errors.allowRules?.message}>
              <Textarea
                id="allowRules"
                rows={3}
                placeholder="/public"
                {...register("allowRules")}
              />
            </FormField>

            <FormField id="disallowRules" label="Disallow rules" error={errors.disallowRules?.message}>
              <Textarea
                id="disallowRules"
                rows={4}
                placeholder="/admin"
                {...register("disallowRules")}
              />
            </FormField>

            <FormField id="host" label="Host" error={errors.host?.message}>
              <Input id="host" placeholder="example.com" {...register("host")} />
            </FormField>

            <FormField id="sitemapUrls" label="Sitemap URLs" error={errors.sitemapUrls?.message}>
              <Textarea
                id="sitemapUrls"
                rows={3}
                value={watchedValues.sitemapUrls.join("\n")}
                onChange={(event) =>
                  setValue(
                    "sitemapUrls",
                    event.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean),
                    { shouldValidate: true },
                  )
                }
              />
            </FormField>

            <FormField id="customDirectives" label="Custom directives" error={errors.customDirectives?.message}>
              <Textarea id="customDirectives" rows={4} {...register("customDirectives")} />
            </FormField>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active configuration</p>
                <p className="text-xs text-muted-foreground">Inactive rules are ignored by the generator</p>
              </div>
              <Switch
                checked={watch("isActive")}
                onCheckedChange={(checked) => setValue("isActive", checked, { shouldValidate: true })}
                aria-label="Active configuration"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save robots.txt
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/settings/seo">Robots settings</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer">
              View live file
            </a>
          </Button>
        </div>
      </form>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live preview</CardTitle>
            <CardDescription>Generated instantly from the current form values</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/40 p-4 text-xs leading-relaxed whitespace-pre-wrap">
              {summary.enabled ? livePreview : "Robots.txt is disabled in settings."}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Validation</CardTitle>
            <CardDescription>Syntax and conflict checks before publishing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.validation.issues.length === 0 ? (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Robots configuration looks valid.</span>
              </div>
            ) : (
              summary.validation.issues.map((issue) => (
                <div
                  key={`${issue.field}-${issue.message}`}
                  className="flex items-start gap-2 rounded-lg border p-3 text-sm"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                  <div>
                    <p className="font-medium">{issue.field}</p>
                    <p className="text-muted-foreground">{issue.message}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
