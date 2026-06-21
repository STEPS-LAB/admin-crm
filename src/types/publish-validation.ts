export interface PublishValidationIssue {
  readonly field: string;
  readonly message: string;
}

export interface PublishWarning {
  readonly id: string;
  readonly field: string;
  readonly message: string;
}

export interface PublishValidationResult {
  readonly valid: boolean;
  readonly issues: readonly PublishValidationIssue[];
}

export function formatPublishValidationError(result: PublishValidationResult): string {
  return result.issues.map((issue) => issue.message).join("; ");
}
