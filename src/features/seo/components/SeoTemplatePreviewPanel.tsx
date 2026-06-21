"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { SeoTemplatePreviewResult } from "@/types/seo-templates";

export interface SeoTemplatePreviewPanelProps {
  readonly preview: SeoTemplatePreviewResult | null;
  readonly isLoading?: boolean;
}

export function SeoTemplatePreviewPanel({
  preview,
  isLoading = false,
}: SeoTemplatePreviewPanelProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Live preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {isLoading ? (
          <p className="text-muted-foreground">Rendering preview…</p>
        ) : preview ? (
          <>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Meta title
              </p>
              <p className="font-medium">{preview.metaTitle || "—"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{preview.metaTitle.length} characters</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Meta description
              </p>
              <p>{preview.metaDescription || "—"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {preview.metaDescription.length} characters
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Open Graph title
              </p>
              <p>{preview.ogTitle || "—"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Open Graph description
              </p>
              <p>{preview.ogDescription || "—"}</p>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">Enter template fields to preview rendered output.</p>
        )}
      </CardContent>
    </Card>
  );
}
