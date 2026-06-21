const IP_ENTRY_PATTERN = /^[\d.:a-fA-F/%]+$/;

export function parseIpListInput(value: unknown): string[] {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function formatIpListInput(values: readonly string[]): string {
  return values.join("\n");
}

export function isValidIpEntry(entry: string): boolean {
  return IP_ENTRY_PATTERN.test(entry) && entry.length <= 64;
}

export function validateIpList(values: readonly string[]): string | null {
  const invalid = values.find((entry) => !isValidIpEntry(entry));

  if (invalid) {
    return `Invalid IP entry: ${invalid}`;
  }

  return null;
}
