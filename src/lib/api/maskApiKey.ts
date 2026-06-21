export function maskApiKey(prefix: string): string {
  return `${prefix}${"•".repeat(16)}`;
}
