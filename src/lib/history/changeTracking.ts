export function collectChangedFields<T extends Record<string, unknown>>(
  before: T,
  after: T,
): string[] {
  const fields = new Set<string>();

  for (const key of Object.keys(after)) {
    const beforeValue = before[key];
    const afterValue = after[key];

    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      fields.add(key);
    }
  }

  return [...fields];
}

export function pickFields<T extends Record<string, unknown>, K extends keyof T>(
  source: T,
  keys: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    result[key] = source[key];
  }

  return result;
}

export function pickChangedFields(
  source: Record<string, unknown>,
  fields: readonly string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const field of fields) {
    result[field] = source[field];
  }

  return result;
}

export interface HistorySnapshotDiff {
  readonly beforeData: Record<string, unknown>;
  readonly afterData: Record<string, unknown>;
  readonly changedFields: string[];
}

export function diffHistorySnapshots(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): HistorySnapshotDiff | null {
  const changedFields = collectChangedFields(before, after);

  if (changedFields.length === 0) {
    return null;
  }

  return {
    beforeData: pickChangedFields(before, changedFields),
    afterData: pickChangedFields(after, changedFields),
    changedFields,
  };
}
