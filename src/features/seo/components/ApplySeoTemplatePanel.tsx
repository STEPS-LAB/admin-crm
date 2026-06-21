"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { applySeoTemplateAction, listSeoTemplatesAction } from "@/actions/seo/seoTemplateActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mapProfileOwnerTypeToTemplateOwnerType } from "@/constants/seo-templates";

import { SeoTemplatePreviewPanel } from "./SeoTemplatePreviewPanel";

import type { SeoOwnerType } from "@/constants/seo";
import type { SeoTemplateListItem, SeoTemplatePreviewResult } from "@/types/seo-templates";

export interface ApplySeoTemplatePanelProps {
  readonly seoProfileId: string;
  readonly ownerType: SeoOwnerType;
  readonly language: "uk" | "en";
}

export function ApplySeoTemplatePanel({
  seoProfileId,
  ownerType,
  language,
}: ApplySeoTemplatePanelProps): React.JSX.Element {
  const router = useRouter();
  const [templates, setTemplates] = useState<SeoTemplateListItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [preview, setPreview] = useState<SeoTemplatePreviewResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const templateOwnerType = mapProfileOwnerTypeToTemplateOwnerType(ownerType) ?? "global";

  useEffect(() => {
    void listSeoTemplatesAction({ ownerType: templateOwnerType, language }).then((items) => {
      setTemplates(items);
      const defaultTemplate = items.find((item) => item.isDefault);
      setSelectedTemplateId(defaultTemplate?.id ?? items[0]?.id ?? "");
    });
  }, [templateOwnerType, language]);

  const runApply = (): void => {
    if (!selectedTemplateId) {
      return;
    }

    startTransition(async () => {
      const result = await applySeoTemplateAction({
        seoProfileId,
        templateId: selectedTemplateId,
      });

      if (result.success) {
        setPreview(result.data);
        toast.success("Template applied to profile metadata");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">Apply template</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/seo/templates">Manage templates</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
          <SelectTrigger aria-label="Select SEO template">
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
                {template.isDefault ? " (default)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={runApply} disabled={!selectedTemplateId || isPending} className="w-full">
          Apply template
        </Button>

        {preview ? <SeoTemplatePreviewPanel preview={preview} /> : null}
      </CardContent>
    </Card>
  );
}
