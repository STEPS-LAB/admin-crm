"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateSeoProfileMetadataAction } from "@/actions/seo/updateSeoProfileMetadata";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { seoMetadataSchema, type SeoMetadataValues } from "@/schemas/seo/seoSchemas";

import type { ServerActionResult } from "@/types";
import type { SeoProfileMutationResult } from "@/services/seoProfileService";

export interface SeoProfileMetadataFormProps {
  readonly profileId: string;
  readonly defaultValues: SeoMetadataValues;
}

const initialState: ServerActionResult<SeoProfileMutationResult> | null = null;

export function SeoProfileMetadataForm({
  profileId,
  defaultValues,
}: SeoProfileMetadataFormProps): React.JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateSeoProfileMetadataAction, initialState);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SeoMetadataValues>({
    resolver: zodResolver(seoMetadataSchema),
    defaultValues,
  });

  useEffect(() => {
    if (state?.success) {
      toast.success("SEO metadata saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("id", profileId);
    formData.set("metaTitle", values.metaTitle ?? "");
    formData.set("metaDescription", values.metaDescription ?? "");
    formData.set("index", String(values.index));
    formData.set("follow", String(values.follow));
    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField id="metaTitle" label="Meta title" error={errors.metaTitle?.message}>
            <Input id="metaTitle" {...register("metaTitle")} />
          </FormField>

          <FormField id="metaDescription" label="Meta description" error={errors.metaDescription?.message}>
            <Textarea id="metaDescription" rows={4} {...register("metaDescription")} />
          </FormField>

          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Allow indexing</p>
              <p className="text-xs text-muted-foreground">Controls robots index and profile indexable flag</p>
            </div>
            <Switch
              checked={watch("index")}
              onCheckedChange={(checked) => setValue("index", checked, { shouldValidate: true })}
              aria-label="Allow indexing"
            />
          </div>

          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Allow following links</p>
              <p className="text-xs text-muted-foreground">Controls robots follow directive</p>
            </div>
            <Switch
              checked={watch("follow")}
              onCheckedChange={(checked) => setValue("follow", checked, { shouldValidate: true })}
              aria-label="Allow following links"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save metadata
        </Button>
      </div>
    </form>
  );
}
