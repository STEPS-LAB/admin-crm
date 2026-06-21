"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createSeoTemplateAction,
  previewSeoTemplateAction,
  updateSeoTemplateAction,
} from "@/actions/seo/seoTemplateActions";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  SEO_TEMPLATE_LANGUAGES,
  SEO_TEMPLATE_OWNER_TYPES,
  SEO_TEMPLATE_OWNER_TYPE_LABELS,
  type SeoTemplateOwnerType,
} from "@/constants/seo-templates";
import { seoTemplateFormSchema, type SeoTemplateFormValues } from "@/schemas/seo/seoTemplateSchemas";

import { SeoTemplatePreviewPanel } from "./SeoTemplatePreviewPanel";
import { SeoTemplateVariablePicker } from "./SeoTemplateVariablePicker";

import type { ServerActionResult } from "@/types";
import type { SeoTemplatePreviewResult } from "@/types/seo-templates";
import type { SeoTemplateMutationResult } from "@/services/seoTemplateService";

export interface SeoTemplateFormProps {
  readonly mode: "create" | "edit";
  readonly templateId?: string;
  readonly defaultValues: SeoTemplateFormValues;
}

const initialState: ServerActionResult<SeoTemplateMutationResult> | null = null;

export function SeoTemplateForm({
  mode,
  templateId,
  defaultValues,
}: SeoTemplateFormProps): React.JSX.Element {
  const router = useRouter();
  const action = mode === "create" ? createSeoTemplateAction : updateSeoTemplateAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [preview, setPreview] = useState<SeoTemplatePreviewResult | null>(null);
  const [isPreviewPending, startPreview] = useTransition();
  const [activeField, setActiveField] = useState<keyof SeoTemplateFormValues | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<SeoTemplateFormValues>({
    resolver: zodResolver(seoTemplateFormSchema),
    defaultValues,
  });

  const ownerType = watch("ownerType");
  const language = watch("language");
  const isDefault = watch("isDefault");
  const metaTitleTemplate = watch("metaTitleTemplate");
  const metaDescriptionTemplate = watch("metaDescriptionTemplate");
  const ogTitleTemplate = watch("ogTitleTemplate");
  const ogDescriptionTemplate = watch("ogDescriptionTemplate");

  const runPreview = useCallback(() => {
    const values = getValues();

    startPreview(async () => {
      const result = await previewSeoTemplateAction({
        ownerType: values.ownerType,
        language: values.language,
        metaTitleTemplate: values.metaTitleTemplate,
        metaDescriptionTemplate: values.metaDescriptionTemplate,
        ogTitleTemplate: values.ogTitleTemplate,
        ogDescriptionTemplate: values.ogDescriptionTemplate,
      });

      if (result.success) {
        setPreview(result.data);
      }
    });
  }, [getValues]);

  useEffect(() => {
    const timeout = setTimeout(runPreview, 300);
    return () => clearTimeout(timeout);
  }, [
    ownerType,
    language,
    metaTitleTemplate,
    metaDescriptionTemplate,
    ogTitleTemplate,
    ogDescriptionTemplate,
    runPreview,
  ]);

  useEffect(() => {
    if (state?.success) {
      toast.success(mode === "create" ? "Template created" : "Template updated");

      if (mode === "create") {
        router.push(`/admin/seo/templates/${state.data.id}`);
      } else {
        router.refresh();
      }
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, mode, router]);

  const insertVariable = (token: string): void => {
    if (!activeField) {
      return;
    }

    const current = getValues(activeField);

    if (typeof current === "string" || current === null) {
      const next = `${current ?? ""}${token}`;
      setValue(activeField, next, { shouldDirty: true, shouldValidate: true });
    }
  };

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();

    if (templateId) {
      formData.set("id", templateId);
    }

    formData.set("ownerType", values.ownerType);
    formData.set("language", values.language);
    formData.set("name", values.name);
    formData.set("metaTitleTemplate", values.metaTitleTemplate ?? "");
    formData.set("metaDescriptionTemplate", values.metaDescriptionTemplate ?? "");
    formData.set("ogTitleTemplate", values.ogTitleTemplate ?? "");
    formData.set("ogDescriptionTemplate", values.ogDescriptionTemplate ?? "");
    formData.set("isDefault", values.isDefault ? "true" : "false");

    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Template settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField id="name" label="Template name" error={errors.name?.message} required>
              <Input id="name" {...register("name")} />
            </FormField>

            <FormField id="ownerType" label="Entity type" error={errors.ownerType?.message} required>
              <Select
                value={ownerType}
                onValueChange={(value) => setValue("ownerType", value as SeoTemplateOwnerType)}
              >
                <SelectTrigger id="ownerType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEO_TEMPLATE_OWNER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {SEO_TEMPLATE_OWNER_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="language" label="Language" error={errors.language?.message} required>
              <Select
                value={language}
                onValueChange={(value) => setValue("language", value as "uk" | "en")}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEO_TEMPLATE_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="isDefault" label="Default template">
              <div className="flex h-10 items-center gap-3">
                <Switch
                  id="isDefault"
                  checked={isDefault}
                  onCheckedChange={(value) => setValue("isDefault", value)}
                />
                <span className="text-sm text-muted-foreground">Use as default for this type</span>
              </div>
            </FormField>
          </CardContent>
        </Card>

        <SeoTemplateVariablePicker ownerType={ownerType} onInsert={insertVariable} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metadata templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField id="metaTitleTemplate" label="Meta title template" error={errors.metaTitleTemplate?.message}>
              <Textarea
                id="metaTitleTemplate"
                rows={2}
                {...register("metaTitleTemplate")}
                onFocus={() => setActiveField("metaTitleTemplate")}
              />
            </FormField>
            <FormField
              id="metaDescriptionTemplate"
              label="Meta description template"
              error={errors.metaDescriptionTemplate?.message}
            >
              <Textarea
                id="metaDescriptionTemplate"
                rows={3}
                {...register("metaDescriptionTemplate")}
                onFocus={() => setActiveField("metaDescriptionTemplate")}
              />
            </FormField>
            <FormField id="ogTitleTemplate" label="Open Graph title template" error={errors.ogTitleTemplate?.message}>
              <Textarea
                id="ogTitleTemplate"
                rows={2}
                {...register("ogTitleTemplate")}
                onFocus={() => setActiveField("ogTitleTemplate")}
              />
            </FormField>
            <FormField
              id="ogDescriptionTemplate"
              label="Open Graph description template"
              error={errors.ogDescriptionTemplate?.message}
            >
              <Textarea
                id="ogDescriptionTemplate"
                rows={3}
                {...register("ogDescriptionTemplate")}
                onFocus={() => setActiveField("ogDescriptionTemplate")}
              />
            </FormField>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === "create" ? "Create template" : "Save template"}
          </Button>
        </div>
      </div>

      <SeoTemplatePreviewPanel preview={preview} isLoading={isPreviewPending} />
    </form>
  );
}
