"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { updateSeoSettingsAction } from "@/actions/settings/updateSeoSettings";
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
import { Textarea } from "@/components/ui/textarea";
import { SITEMAP_FREQUENCY_OPTIONS } from "@/constants/settings";
import { SettingsFormFooter } from "@/features/settings/components/SettingsFormFooter";
import { seoSettingsSchema, type SeoSettingsValues } from "@/schemas/settings/settingsSchemas";

import type { ServerActionResult } from "@/types";
import type { SettingsMutationResult } from "@/services/settingsService";

export interface SeoSettingsFormProps {
  readonly defaultValues: SeoSettingsValues;
}

const initialState: ServerActionResult<SettingsMutationResult> | null = null;

export function SeoSettingsForm({ defaultValues }: SeoSettingsFormProps): React.JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateSeoSettingsAction, initialState);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SeoSettingsValues>({
    resolver: zodResolver(seoSettingsSchema) as Resolver<SeoSettingsValues>,
    defaultValues,
  });

  useEffect(() => {
    if (state?.success) {
      toast.success("SEO settings saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("defaultMetaTitle", values.defaultMetaTitle ?? "");
    formData.set("defaultMetaDescription", values.defaultMetaDescription ?? "");
    formData.set("defaultOgImage", values.defaultOgImage ?? "");
    formData.set("defaultTwitterCard", values.defaultTwitterCard);
    formData.set("defaultIndexing", String(values.defaultIndexing));
    formData.set("defaultFollow", String(values.defaultFollow));
    formData.set("defaultRobots", values.defaultRobots);
    formData.set("sitemapEnabled", String(values.sitemapEnabled));
    formData.set("sitemapAutoGenerate", String(values.sitemapAutoGenerate));
    formData.set("sitemapUpdateFrequency", values.sitemapUpdateFrequency);
    formData.set("sitemapIncludeImages", String(values.sitemapIncludeImages));
    formData.set("sitemapIncludeVideos", String(values.sitemapIncludeVideos));
    formData.set("robotsEnabled", String(values.robotsEnabled));
    formData.set("robotsContent", values.robotsContent ?? "");
    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField id="defaultMetaTitle" label="Default meta title" error={errors.defaultMetaTitle?.message}>
            <Input id="defaultMetaTitle" {...register("defaultMetaTitle")} />
          </FormField>
          <FormField
            id="defaultMetaDescription"
            label="Default meta description"
            error={errors.defaultMetaDescription?.message}
          >
            <Textarea id="defaultMetaDescription" rows={3} {...register("defaultMetaDescription")} />
          </FormField>
          <FormField id="defaultOgImage" label="Default Open Graph image URL" error={errors.defaultOgImage?.message}>
            <Input id="defaultOgImage" type="url" {...register("defaultOgImage")} />
          </FormField>
          <FormField id="defaultTwitterCard" label="Default Twitter card" error={errors.defaultTwitterCard?.message}>
            <Select
              value={watch("defaultTwitterCard")}
              onValueChange={(value) =>
                setValue("defaultTwitterCard", value as SeoSettingsValues["defaultTwitterCard"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="defaultTwitterCard">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="summary_large_image">Summary large image</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="defaultRobots" label="Default robots directive" error={errors.defaultRobots?.message}>
            <Input id="defaultRobots" {...register("defaultRobots")} />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <span className="text-sm font-medium">Default indexing</span>
              <Switch
                checked={watch("defaultIndexing")}
                onCheckedChange={(checked) => setValue("defaultIndexing", checked, { shouldValidate: true })}
                aria-label="Default indexing"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <span className="text-sm font-medium">Default follow</span>
              <Switch
                checked={watch("defaultFollow")}
                onCheckedChange={(checked) => setValue("defaultFollow", checked, { shouldValidate: true })}
                aria-label="Default follow"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sitemap</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <span className="text-sm font-medium">Sitemap enabled</span>
              <Switch
                checked={watch("sitemapEnabled")}
                onCheckedChange={(checked) => setValue("sitemapEnabled", checked, { shouldValidate: true })}
                aria-label="Sitemap enabled"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <span className="text-sm font-medium">Auto-generate</span>
              <Switch
                checked={watch("sitemapAutoGenerate")}
                onCheckedChange={(checked) => setValue("sitemapAutoGenerate", checked, { shouldValidate: true })}
                aria-label="Auto-generate sitemap"
              />
            </div>
          </div>
          <FormField
            id="sitemapUpdateFrequency"
            label="Update frequency"
            error={errors.sitemapUpdateFrequency?.message}
          >
            <Select
              value={watch("sitemapUpdateFrequency") ?? "daily"}
              onValueChange={(value) =>
                setValue("sitemapUpdateFrequency", value as SeoSettingsValues["sitemapUpdateFrequency"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="sitemapUpdateFrequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SITEMAP_FREQUENCY_OPTIONS.map((frequency) => (
                  <SelectItem key={frequency} value={frequency}>
                    {frequency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <span className="text-sm font-medium">Include images</span>
              <Switch
                checked={watch("sitemapIncludeImages")}
                onCheckedChange={(checked) => setValue("sitemapIncludeImages", checked, { shouldValidate: true })}
                aria-label="Include images in sitemap"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <span className="text-sm font-medium">Include videos</span>
              <Switch
                checked={watch("sitemapIncludeVideos")}
                onCheckedChange={(checked) => setValue("sitemapIncludeVideos", checked, { shouldValidate: true })}
                aria-label="Include videos in sitemap"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Robots.txt</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <span className="text-sm font-medium">Robots.txt enabled</span>
            <Switch
              checked={watch("robotsEnabled")}
              onCheckedChange={(checked) => setValue("robotsEnabled", checked, { shouldValidate: true })}
              aria-label="Robots.txt enabled"
            />
          </div>
          <FormField id="robotsContent" label="Custom robots.txt content" error={errors.robotsContent?.message}>
            <Textarea id="robotsContent" rows={6} className="font-mono text-sm" {...register("robotsContent")} />
          </FormField>
        </CardContent>
      </Card>

      <SettingsFormFooter isPending={isPending} />
    </form>
  );
}
