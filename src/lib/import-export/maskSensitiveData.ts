const SENSITIVE_KEY_PATTERN =
  /(password|secret|token|credential|api[_-]?key|smtp_password|encrypted)/i;

function maskValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => maskValue(item));
  }

  if (value && typeof value === "object") {
    return maskRecord(value as Record<string, unknown>);
  }

  return value;
}

export function maskRecord(record: Record<string, unknown>): Record<string, unknown> {
  const masked: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      masked[key] = "[REDACTED]";
      continue;
    }

    masked[key] = maskValue(value);
  }

  return masked;
}
