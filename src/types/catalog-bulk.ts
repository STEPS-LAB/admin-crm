export interface BulkOperationResult {
  readonly succeededIds: string[];
  readonly failures: ReadonlyArray<{
    readonly id: string;
    readonly error: string;
  }>;
}
