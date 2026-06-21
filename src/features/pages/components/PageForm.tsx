"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createPageAction } from "@/actions/pages/createPage";
import { updatePageAction } from "@/actions/pages/updatePage";
import { FormField } from "@/components/forms/FormField";
import { RichTextField } from "@/components/forms/RichTextField";
import { PublishReadinessPanel } from "@/features/catalog/components/PublishReadinessPanel";
import { PageMediaPanel } from "@/features/pages/components/PageMediaPanel";
import { EntitySeoPanel } from "@/features/seo/components/EntitySeoPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PAGE_STATUSES, PAGE_STATUS_LABELS, PAGE_TYPES, PAGE_TYPE_LABELS } from "@/constants/pages";
import { collectPagePublishBlockingIssues, collectPagePublishWarnings } from "@/lib/catalog/publishWarnings";
import { slugify } from "@/lib/utils/slug";
import { pageFormSchema, type PageFormValues } from "@/schemas/pages/pageSchemas";

import type { ServerActionResult } from "@/types";
import type { EntityMediaCollection } from "@/types/entity-media";
import type { EntitySeoProfiles } from "@/types/seo-center";
import type { PageMutationResult } from "@/services/pageService";

export interface PageFormProps {
  readonly mode: "create" | "edit";
  readonly pageId?: string;
  readonly defaultValues: PageFormValues;
  readonly media?: EntityMediaCollection;
  readonly seoProfiles?: EntitySeoProfiles;
  readonly seoScore?: number | null;
}

const initialState: ServerActionResult<PageMutationResult> | null = null;

export function PageForm({
  mode,
  pageId,
  defaultValues,
  media,
  seoProfiles,
  seoScore = null,
}: PageFormProps): React.JSX.Element {
  const router = useRouter();
  const action = mode === "create" ? createPageAction : updatePageAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = form;

  const watchedValues = watch();
  const showPublishReadiness = watchedValues.status === "published";
  const publishBlockingIssues = useMemo(
    () => collectPagePublishBlockingIssues(watchedValues),
    [watchedValues],
  );
  const publishWarnings = useMemo(
    () =>
      collectPagePublishWarnings(watchedValues, {
        media: media ?? null,
        seoScore,
      }),
    [watchedValues, media, seoScore],
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(mode === "create" ? "Page created" : "Page saved");
      router.push(`/admin/pages/${state.data.id}`);
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, mode, router]);

  const generateSlug = (language: "uk" | "en"): void => {
    const title = watch(`translations.${language}.title`);

    if (title) {
      setValue(`translations.${language}.slug`, slugify(title), { shouldValidate: true });
    }
  };

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();

    if (mode === "edit" && pageId) {
      formData.set("id", pageId);
    }

    formData.set("pageType", values.pageType);
    formData.set("status", values.status);
    formData.set("isHomepage", values.isHomepage ? "true" : "false");
    formData.set("sortOrder", String(values.sortOrder));

    for (const language of ["uk", "en"] as const) {
      const translation = values.translations[language];
      formData.set(`translations.${language}.title`, translation.title);
      formData.set(`translations.${language}.slug`, translation.slug);
      formData.set(`translations.${language}.content`, translation.content ?? "");
      formData.set(`translations.${language}.excerpt`, translation.excerpt ?? "");
    }

    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <PublishReadinessPanel
        visible={showPublishReadiness}
        blockingIssues={publishBlockingIssues}
        warnings={publishWarnings}
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media" disabled={mode === "create"}>
            Media
          </TabsTrigger>
          <TabsTrigger value="seo" disabled={mode === "create"}>
            SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Page settings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField id="pageType" label="Page type" required error={errors.pageType?.message}>
                <Select
                  value={watch("pageType")}
                  onValueChange={(value) =>
                    setValue("pageType", value as PageFormValues["pageType"], { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="pageType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_TYPES.map((pageType) => (
                      <SelectItem key={pageType} value={pageType}>
                        {PAGE_TYPE_LABELS[pageType]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="status" label="Status" required error={errors.status?.message}>
                <Select
                  value={watch("status")}
                  onValueChange={(value) =>
                    setValue("status", value as PageFormValues["status"], { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {PAGE_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="sortOrder" label="Sort order" required error={errors.sortOrder?.message}>
                <Input id="sortOrder" type="number" min={0} {...register("sortOrder")} />
              </FormField>

              <div className="flex items-end pb-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isHomepage"
                    checked={watch("isHomepage")}
                    onCheckedChange={(checked) =>
                      setValue("isHomepage", checked === true, { shouldValidate: true })
                    }
                  />
                  <Label htmlFor="isHomepage">Set as homepage</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="mt-6 space-y-6">
          {(["uk", "en"] as const).map((language) => (
            <Card key={language}>
              <CardHeader>
                <CardTitle className="text-base">
                  {language === "uk" ? "Ukrainian" : "English"}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  id={`translations.${language}.title`}
                  label="Title"
                  required
                  error={errors.translations?.[language]?.title?.message}
                >
                  <Input id={`translations.${language}.title`} {...register(`translations.${language}.title`)} />
                </FormField>

                <FormField
                  id={`translations.${language}.slug`}
                  label="Slug"
                  required
                  error={errors.translations?.[language]?.slug?.message}
                >
                  <div className="flex gap-2">
                    <Input id={`translations.${language}.slug`} {...register(`translations.${language}.slug`)} />
                    <Button type="button" variant="outline" onClick={() => generateSlug(language)}>
                      Generate
                    </Button>
                  </div>
                </FormField>

                <FormField
                  id={`translations.${language}.excerpt`}
                  label="Excerpt"
                  error={errors.translations?.[language]?.excerpt?.message}
                >
                  <Textarea
                    id={`translations.${language}.excerpt`}
                    rows={3}
                    {...register(`translations.${language}.excerpt`)}
                  />
                </FormField>

                <RichTextField
                  name={`translations.${language}.content`}
                  control={control}
                  id={`translations.${language}.content`}
                  label="Content"
                  error={errors.translations?.[language]?.content?.message}
                  placeholder="Write page content…"
                  minHeight={320}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          {mode === "edit" && pageId && media ? (
            <PageMediaPanel pageId={pageId} media={media} />
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Save the page first to attach images from the media library.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          {mode === "edit" && seoProfiles ? (
            <EntitySeoPanel profiles={seoProfiles} />
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Save the page first to configure SEO metadata.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/pages")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Create page" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
