"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { deleteMediaAction } from "@/actions/media/deleteMedia";
import { updateMediaMetadataAction } from "@/actions/media/updateMediaMetadata";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { mediaMetadataSchema, type MediaMetadataValues } from "@/schemas/media/mediaSchemas";

import type { ServerActionResult } from "@/types";
import type { MediaMutationResult } from "@/services/mediaService";

export interface MediaMetadataFormProps {
  readonly mediaId: string;
  readonly defaultValues: MediaMetadataValues;
  readonly canDelete: boolean;
}

const initialState: ServerActionResult<MediaMutationResult> | null = null;

export function MediaMetadataForm({
  mediaId,
  defaultValues,
  canDelete,
}: MediaMetadataFormProps): React.JSX.Element {
  const router = useRouter();
  const [isDeleting, startDelete] = useTransition();
  const [state, formAction, isPending] = useActionState(updateMediaMetadataAction, initialState);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MediaMetadataValues>({
    resolver: zodResolver(mediaMetadataSchema) as Resolver<MediaMetadataValues>,
    defaultValues,
  });

  useEffect(() => {
    if (state?.success) {
      toast.success("Media metadata saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("id", mediaId);
    formData.set("altUk", values.altUk ?? "");
    formData.set("altEn", values.altEn ?? "");
    formData.set("titleUk", values.titleUk ?? "");
    formData.set("titleEn", values.titleEn ?? "");
    formData.set("captionUk", values.captionUk ?? "");
    formData.set("captionEn", values.captionEn ?? "");
    formData.set("copyright", values.copyright ?? "");
    formData.set("photographer", values.photographer ?? "");
    formData.set("license", values.license ?? "");
    formData.set("isPublic", String(values.isPublic));
    formAction(formData);
  });

  const runDelete = (): void => {
    startDelete(async () => {
      const result = await deleteMediaAction(mediaId);

      if (result.success) {
        toast.success("Media deleted");
        router.push("/admin/media");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SEO & accessibility</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField id="altUk" label="Alt text (UK)" error={errors.altUk?.message}>
            <Input id="altUk" {...register("altUk")} />
          </FormField>
          <FormField id="altEn" label="Alt text (EN)" error={errors.altEn?.message}>
            <Input id="altEn" {...register("altEn")} />
          </FormField>
          <FormField id="titleUk" label="Title (UK)" error={errors.titleUk?.message}>
            <Input id="titleUk" {...register("titleUk")} />
          </FormField>
          <FormField id="titleEn" label="Title (EN)" error={errors.titleEn?.message}>
            <Input id="titleEn" {...register("titleEn")} />
          </FormField>
          <div className="md:col-span-2">
            <FormField id="captionUk" label="Caption (UK)" error={errors.captionUk?.message}>
              <Textarea id="captionUk" rows={2} {...register("captionUk")} />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField id="captionEn" label="Caption (EN)" error={errors.captionEn?.message}>
              <Textarea id="captionEn" rows={2} {...register("captionEn")} />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rights & visibility</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField id="copyright" label="Copyright" error={errors.copyright?.message}>
            <Input id="copyright" {...register("copyright")} />
          </FormField>
          <FormField id="photographer" label="Photographer" error={errors.photographer?.message}>
            <Input id="photographer" {...register("photographer")} />
          </FormField>
          <FormField id="license" label="License" error={errors.license?.message}>
            <Input id="license" {...register("license")} />
          </FormField>
          <div className="flex items-center justify-between rounded-md border px-4 py-3 md:col-span-2">
            <div>
              <p className="text-sm font-medium">Public asset</p>
              <p className="text-xs text-muted-foreground">Visible via public storage URL</p>
            </div>
            <Switch
              checked={watch("isPublic")}
              onCheckedChange={(checked) => setValue("isPublic", checked, { shouldValidate: true })}
              aria-label="Public asset"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="destructive"
          disabled={!canDelete || isDeleting || isPending}
          onClick={runDelete}
        >
          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
          Delete
        </Button>
        <Button type="submit" disabled={isPending || isDeleting}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save metadata
        </Button>
      </div>
    </form>
  );
}
