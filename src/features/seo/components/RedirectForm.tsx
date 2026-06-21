"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createRedirectAction } from "@/actions/seo/createRedirect";
import { updateRedirectAction } from "@/actions/seo/updateRedirect";
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
import { REDIRECT_STATUS_CODES } from "@/constants/seo";
import { redirectFormSchema, type RedirectFormValues } from "@/schemas/seo/seoSchemas";

import type { ServerActionResult } from "@/types";
import type { RedirectMutationResult } from "@/services/redirectService";

export interface RedirectFormProps {
  readonly mode: "create" | "edit";
  readonly redirectId?: string;
  readonly defaultValues: RedirectFormValues;
}

const initialState: ServerActionResult<RedirectMutationResult> | null = null;

export function RedirectForm({
  mode,
  redirectId,
  defaultValues,
}: RedirectFormProps): React.JSX.Element {
  const router = useRouter();
  const action = mode === "create" ? createRedirectAction : updateRedirectAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RedirectFormValues>({
    resolver: zodResolver(redirectFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(mode === "create" ? "Redirect created" : "Redirect updated");

      if (mode === "create") {
        router.push(`/admin/seo/redirects/${state.data.id}`);
      } else {
        router.refresh();
      }
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, mode, router]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();

    if (redirectId) {
      formData.set("id", redirectId);
    }

    formData.set("source", values.source);
    formData.set("destination", values.destination);
    formData.set("statusCode", values.statusCode);
    formData.set("enabled", String(values.enabled));
    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Redirect rule</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField id="source" label="Source path" error={errors.source?.message} description="Must start with /">
            <Input id="source" placeholder="/old-path" {...register("source")} />
          </FormField>

          <FormField
            id="destination"
            label="Destination"
            error={errors.destination?.message}
            description="Path or absolute URL"
          >
            <Input id="destination" placeholder="/new-path" {...register("destination")} />
          </FormField>

          <FormField id="statusCode" label="HTTP status" error={errors.statusCode?.message}>
            <Select
              value={watch("statusCode")}
              onValueChange={(value) =>
                setValue("statusCode", value as RedirectFormValues["statusCode"], { shouldValidate: true })
              }
            >
              <SelectTrigger id="statusCode">
                <SelectValue placeholder="Select status code" />
              </SelectTrigger>
              <SelectContent>
                {REDIRECT_STATUS_CODES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Enabled</p>
              <p className="text-xs text-muted-foreground">Disabled redirects are ignored at runtime</p>
            </div>
            <Switch
              checked={watch("enabled")}
              onCheckedChange={(checked) => setValue("enabled", checked, { shouldValidate: true })}
              aria-label="Enable redirect"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/seo/redirects")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Create redirect" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
