"use client";

import { Button } from "@/components/ui/button";
import { getSeoTemplateVariables } from "@/constants/seo-templates";

import type { SeoTemplateOwnerType } from "@/constants/seo-templates";

export interface SeoTemplateVariablePickerProps {
  readonly ownerType: SeoTemplateOwnerType;
  readonly onInsert: (token: string) => void;
}

export function SeoTemplateVariablePicker({
  ownerType,
  onInsert,
}: SeoTemplateVariablePickerProps): React.JSX.Element {
  const variables = getSeoTemplateVariables(ownerType);

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <div>
        <p className="text-sm font-medium">Template variables</p>
        <p className="text-xs text-muted-foreground">
          Click to insert tokens. Use <code className="rounded bg-muted px-1">|fallback</code> for empty values.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {variables.map((variable) => (
          <Button
            key={variable.token}
            type="button"
            variant="outline"
            size="sm"
            className="h-auto whitespace-normal px-2 py-1 text-left text-xs"
            onClick={() => onInsert(variable.token)}
            title={variable.description}
          >
            {variable.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
