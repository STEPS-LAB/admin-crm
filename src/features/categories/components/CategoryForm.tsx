"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createCategoryAction } from "@/actions/categories/createCategory";
import { updateCategoryAction } from "@/actions/categories/updateCategory";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_STATUSES, CATEGORY_STATUS_LABELS } from "@/constants/categories";
import { PublishReadinessPanel } from "@/features/catalog/components/PublishReadinessPanel";
import { CategoryMediaPanel } from "@/features/categories/components/CategoryMediaPanel";
import {
  collectCategoryPublishBlockingIssues,
  collectCategoryPublishWarnings,
} from "@/lib/catalog/publishWarnings";
import { slugify } from "@/lib/utils/slug";
import { categoryFormSchema, type CategoryFormValues } from "@/schemas/categories/categorySchemas";

import type { CategoryParentOption } from "@/types/categories";
import type { EntityMediaCollection } from "@/types/entity-media";
import type { ServerActionResult } from "@/types";
import type { CategoryMutationResult } from "@/services/categoryService";

export interface CategoryFormProps {
  readonly mode: "create" | "edit";
  readonly categoryId?: string;
  readonly defaultValues: CategoryFormValues;
  readonly parentOptions: CategoryParentOption[];
  readonly media?: EntityMediaCollection;
  readonly seoScore?: number | null;
}

const initialState: ServerActionResult<CategoryMutationResult> | null = null;

export function CategoryForm({
  mode,
  categoryId,
  defaultValues,
  parentOptions,
  media,
  seoScore = null,
}: CategoryFormProps): React.JSX.Element {
  const router = useRouter();
  const action = mode === "create" ? createCategoryAction : updateCategoryAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const watchedValues = watch();
  const showPublishReadiness = watchedValues.status === "published";
  const publishBlockingIssues = useMemo(
    () => collectCategoryPublishBlockingIssues(watchedValues),
    [watchedValues],
  );
  const publishWarnings = useMemo(
    () =>
      collectCategoryPublishWarnings(watchedValues, {
        media: media ?? null,
        seoScore,
      }),
    [watchedValues, media, seoScore],
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(mode === "create" ? "Category created" : "Category saved");
      router.push(`/admin/categories/${state.data.id}`);
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, mode, router]);

  const generateSlug = (language: "uk" | "en"): void => {
    const name = watch(`translations.${language}.name`);

    if (name) {
      setValue(`translations.${language}.slug`, slugify(name), { shouldValidate: true });
    }
  };

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();

    if (mode === "edit" && categoryId) {
      formData.set("id", categoryId);
    }

    formData.set("parentId", values.parentId ?? "none");
    formData.set("sortOrder", String(values.sortOrder));
    formData.set("status", values.status);

    for (const language of ["uk", "en"] as const) {
      const translation = values.translations[language];
      formData.set(`translations.${language}.name`, translation.name);
      formData.set(`translations.${language}.slug`, translation.slug);
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
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media" disabled={mode === "create"}>
            Media
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Taxonomy</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField id="parentId" label="Parent category" error={errors.parentId?.message}>
                <Select
                  value={watch("parentId") ?? "none"}
                  onValueChange={(value) =>
                    setValue("parentId", value === "none" ? null : value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="parentId">
                    <SelectValue placeholder="Root category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Root (no parent)</SelectItem>
                    {parentOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="sortOrder" label="Sort order" required error={errors.sortOrder?.message}>
                <Input id="sortOrder" type="number" min={0} {...register("sortOrder")} />
              </FormField>

              <FormField id="status" label="Status" required error={errors.status?.message}>
                <Select
                  value={watch("status")}
                  onValueChange={(value) =>
                    setValue("status", value as CategoryFormValues["status"], { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {CATEGORY_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
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
                  id={`translations.${language}.name`}
                  label="Name"
                  required
                  error={errors.translations?.[language]?.name?.message}
                >
                  <Input id={`translations.${language}.name`} {...register(`translations.${language}.name`)} />
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
                  id={`translations.${language}.description`}
                  label="Description"
                  error={errors.translations?.[language]?.description?.message}
                >
                  <Textarea
                    id={`translations.${language}.description`}
                    rows={6}
                    {...register(`translations.${language}.description`)}
                  />
                </FormField>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          {mode === "edit" && categoryId && media ? (
            <CategoryMediaPanel categoryId={categoryId} media={media} />
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Save the category first to attach images from the media library.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/categories")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Create category" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
