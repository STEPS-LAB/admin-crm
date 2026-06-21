"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createBrandAction } from "@/actions/brands/createBrand";
import { updateBrandAction } from "@/actions/brands/updateBrand";
import { FormField } from "@/components/forms/FormField";
import { RichTextField } from "@/components/forms/RichTextField";
import { PublishReadinessPanel } from "@/features/catalog/components/PublishReadinessPanel";
import { BrandMediaPanel } from "@/features/brands/components/BrandMediaPanel";
import { EntitySeoPanel } from "@/features/seo/components/EntitySeoPanel";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BRAND_STATUSES, BRAND_STATUS_LABELS } from "@/constants/brands";
import { collectBrandPublishBlockingIssues, collectBrandPublishWarnings } from "@/lib/catalog/publishWarnings";
import { slugify } from "@/lib/utils/slug";
import { brandFormSchema, type BrandFormValues } from "@/schemas/brands/brandSchemas";

import type { ServerActionResult } from "@/types";
import type { EntityMediaCollection } from "@/types/entity-media";
import type { EntitySeoProfiles } from "@/types/seo-center";
import type { BrandMutationResult } from "@/services/brandService";

export interface BrandFormProps {
  readonly mode: "create" | "edit";
  readonly brandId?: string;
  readonly defaultValues: BrandFormValues;
  readonly media?: EntityMediaCollection;
  readonly seoProfiles?: EntitySeoProfiles;
  readonly seoScore?: number | null;
}

const initialState: ServerActionResult<BrandMutationResult> | null = null;

export function BrandForm({
  mode,
  brandId,
  defaultValues,
  media,
  seoProfiles,
  seoScore = null,
}: BrandFormProps): React.JSX.Element {
  const router = useRouter();
  const action = mode === "create" ? createBrandAction : updateBrandAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
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
    () => collectBrandPublishBlockingIssues(watchedValues),
    [watchedValues],
  );
  const publishWarnings = useMemo(
    () =>
      collectBrandPublishWarnings(watchedValues, {
        media: media ?? null,
        seoScore,
      }),
    [watchedValues, media, seoScore],
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(mode === "create" ? "Brand created" : "Brand saved");
      router.push(`/admin/brands/${state.data.id}`);
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, mode, router]);

  const generateSlug = (): void => {
    const name = watch("translations.uk.name");

    if (name) {
      setValue("slug", slugify(name), { shouldValidate: true });
    }
  };

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();

    if (mode === "edit" && brandId) {
      formData.set("id", brandId);
    }

    formData.set("slug", values.slug);
    formData.set("logoUrl", values.logoUrl ?? "");
    formData.set("website", values.website ?? "");
    formData.set("country", values.country ?? "");
    formData.set("status", values.status);

    for (const language of ["uk", "en"] as const) {
      const translation = values.translations[language];
      formData.set(`translations.${language}.name`, translation.name);
      formData.set(`translations.${language}.description`, translation.description ?? "");
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
          <TabsTrigger value="description">Description</TabsTrigger>
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
              <CardTitle className="text-base">Brand details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                id="translations.uk.name"
                label="Brand name (UA)"
                required
                error={errors.translations?.uk?.name?.message}
              >
                <Input id="translations.uk.name" {...register("translations.uk.name")} />
              </FormField>

              <FormField
                id="translations.en.name"
                label="Brand name (EN)"
                required
                error={errors.translations?.en?.name?.message}
              >
                <Input id="translations.en.name" {...register("translations.en.name")} />
              </FormField>

              <FormField id="slug" label="Slug" required error={errors.slug?.message}>
                <div className="flex gap-2">
                  <Input id="slug" {...register("slug")} />
                  <Button type="button" variant="outline" onClick={generateSlug}>
                    Generate
                  </Button>
                </div>
              </FormField>

              <FormField id="status" label="Status" required error={errors.status?.message}>
                <Select
                  value={watch("status")}
                  onValueChange={(value) =>
                    setValue("status", value as BrandFormValues["status"], { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAND_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {BRAND_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="country" label="Country" error={errors.country?.message}>
                <Input id="country" placeholder="e.g. Ukraine" {...register("country")} />
              </FormField>

              <FormField id="website" label="Website" error={errors.website?.message}>
                <Input id="website" type="url" placeholder="https://" {...register("website")} />
              </FormField>

              <FormField id="logoUrl" label="Logo URL" error={errors.logoUrl?.message} className="md:col-span-2">
                <Input id="logoUrl" type="url" placeholder="https://" {...register("logoUrl")} />
              </FormField>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="description" className="mt-6 space-y-6">
          {(["uk", "en"] as const).map((language) => (
            <Card key={language}>
              <CardHeader>
                <CardTitle className="text-base">
                  {language === "uk" ? "Ukrainian" : "English"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextField
                  name={`translations.${language}.description`}
                  control={control}
                  id={`translations.${language}.description`}
                  label="Description"
                  error={errors.translations?.[language]?.description?.message}
                  placeholder="Write brand description…"
                  minHeight={280}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          {mode === "edit" && brandId && media ? (
            <BrandMediaPanel brandId={brandId} media={media} />
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Save the brand first to attach images from the media library.
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
                Save the brand first to configure SEO metadata.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Create brand" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
