"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { PublishValidationIssue, PublishWarning } from "@/types/publish-validation";

export interface PublishReadinessPanelProps {
  readonly visible: boolean;
  readonly blockingIssues: readonly PublishValidationIssue[];
  readonly warnings: readonly PublishWarning[];
}

export function PublishReadinessPanel({
  visible,
  blockingIssues,
  warnings,
}: PublishReadinessPanelProps): React.JSX.Element | null {
  if (!visible || (blockingIssues.length === 0 && warnings.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-3">
      {blockingIssues.length > 0 ? (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Cannot publish yet</AlertTitle>
          <AlertDescription>
            <ul className="list-disc space-y-1 pl-4">
              {blockingIssues.map((issue) => (
                <li key={`${issue.field}-${issue.message}`}>{issue.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}

      {warnings.length > 0 ? (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Publish recommendations</AlertTitle>
          <AlertDescription>
            <p className="mb-2">You can publish, but addressing these items will improve quality and SEO.</p>
            <ul className="list-disc space-y-1 pl-4">
              {warnings.map((warning) => (
                <li key={warning.id}>{warning.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
