"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createProductAction } from "@/actions/products/createProduct";
import { updateProductAction } from "@/actions/products/updateProduct";
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
import {
  PRODUCT_STATUSES,
  PRODUCT_STATUS_LABELS,
  STOCK_STATUSES,
  STOCK_STATUS_LABELS,
} from "@/constants/products";
import { slugify } from "@/lib/utils/slug";
import { PublishReadinessPanel } from "@/features/catalog/components/PublishReadinessPanel";
import { ProductMediaPanel } from "@/features/products/components/ProductMediaPanel";
import {
  collectProductPublishBlockingIssues,
  collectProductPublishWarnings,
} from "@/lib/catalog/publishWarnings";
import { productFormSchema, type ProductFormValues } from "@/schemas/products/productSchemas";

import type { ProductFormLookupOption } from "@/types/products";
import type { EntityMediaCollection } from "@/types/entity-media";
import type { ServerActionResult } from "@/types";
import type { ProductMutationResult } from "@/services/productService";

export interface ProductFormProps {
  readonly mode: "create" | "edit";
  readonly productId?: string;
  readonly defaultValues: ProductFormValues;
  readonly categories: ProductFormLookupOption[];
  readonly brands: ProductFormLookupOption[];
  readonly media?: EntityMediaCollection;
  readonly seoScore?: number | null;
}

const initialState: ServerActionResult<ProductMutationResult> | null = null;

export function ProductForm({
  mode,
  productId,
  defaultValues,
  categories,
  brands,
  media,
  seoScore = null,
}: ProductFormProps): React.JSX.Element {
  const router = useRouter();
  const action = mode === "create" ? createProductAction : updateProductAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
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
    () => collectProductPublishBlockingIssues(watchedValues),
    [watchedValues],
  );
  const publishWarnings = useMemo(
    () =>
      collectProductPublishWarnings(watchedValues, {
        media: media ?? null,
        seoScore,
      }),
    [watchedValues, media, seoScore],
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(mode === "create" ? "Product created" : "Product saved");
      router.push(`/admin/products/${state.data.id}`);
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

    if (mode === "edit" && productId) {
      formData.set("id", productId);
    }

    formData.set("sku", values.sku);
    formData.set("barcode", values.barcode ?? "");
    formData.set("categoryId", values.categoryId);
    formData.set("brandId", values.brandId ?? "");
    formData.set("status", values.status);
    formData.set("price", values.price);
    formData.set("oldPrice", values.oldPrice ?? "");
    formData.set("currency", values.currency);
    formData.set("stockQuantity", String(values.stockQuantity));
    formData.set("stockStatus", values.stockStatus);

    for (const language of ["uk", "en"] as const) {
      const translation = values.translations[language];
      formData.set(`translations.${language}.name`, translation.name);
      formData.set(`translations.${language}.slug`, translation.slug);
      formData.set(`translations.${language}.shortDescription`, translation.shortDescription ?? "");
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

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catalog details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField id="sku" label="SKU" required error={errors.sku?.message}>
                <Input id="sku" {...register("sku")} />
              </FormField>

              <FormField id="barcode" label="Barcode" error={errors.barcode?.message}>
                <Input id="barcode" {...register("barcode")} />
              </FormField>

              <FormField id="categoryId" label="Category" required error={errors.categoryId?.message}>
                <Select
                  value={watch("categoryId")}
                  onValueChange={(value) => setValue("categoryId", value, { shouldValidate: true })}
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="brandId" label="Brand" error={errors.brandId?.message}>
                <Select
                  value={watch("brandId") ?? "none"}
                  onValueChange={(value) =>
                    setValue("brandId", value === "none" ? null : value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="brandId">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No brand</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="status" label="Status" required error={errors.status?.message}>
                <Select
                  value={watch("status")}
                  onValueChange={(value) =>
                    setValue("status", value as ProductFormValues["status"], { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {PRODUCT_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="stockStatus" label="Stock status" required error={errors.stockStatus?.message}>
                <Select
                  value={watch("stockStatus")}
                  onValueChange={(value) =>
                    setValue("stockStatus", value as ProductFormValues["stockStatus"], {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="stockStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STOCK_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STOCK_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="price" label="Price" required error={errors.price?.message}>
                <Input id="price" inputMode="decimal" {...register("price")} />
              </FormField>

              <FormField id="oldPrice" label="Old price" error={errors.oldPrice?.message}>
                <Input id="oldPrice" inputMode="decimal" {...register("oldPrice")} />
              </FormField>

              <FormField id="currency" label="Currency" required error={errors.currency?.message}>
                <Input id="currency" maxLength={3} {...register("currency")} />
              </FormField>

              <FormField id="stockQuantity" label="Stock quantity" required error={errors.stockQuantity?.message}>
                <Input id="stockQuantity" type="number" min={0} {...register("stockQuantity")} />
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
                  id={`translations.${language}.shortDescription`}
                  label="Short description"
                  error={errors.translations?.[language]?.shortDescription?.message}
                  description="Maximum 500 characters"
                >
                  <Textarea
                    id={`translations.${language}.shortDescription`}
                    rows={3}
                    maxLength={500}
                    {...register(`translations.${language}.shortDescription`)}
                  />
                </FormField>

                <FormField
                  id={`translations.${language}.description`}
                  label="Description"
                  error={errors.translations?.[language]?.description?.message}
                >
                  <Textarea
                    id={`translations.${language}.description`}
                    rows={8}
                    {...register(`translations.${language}.description`)}
                  />
                </FormField>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          {mode === "edit" && productId && media ? (
            <ProductMediaPanel productId={productId} media={media} />
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Save the product first to attach images from the media library.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Create product" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
