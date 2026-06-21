const TEMPLATE_TOKEN_PATTERN = /\{\{\s*([a-zA-Z0-9_.]+)(?:\|([^}]*))?\s*\}\}/g;

export type SeoTemplateContextValue = string | number | boolean | null | undefined;

export interface SeoTemplateContext {
  [key: string]: SeoTemplateContextValue | SeoTemplateContext;
}

function resolvePath(context: SeoTemplateContext, path: string): SeoTemplateContextValue {
  const segments = path.split(".");
  let current: SeoTemplateContextValue | SeoTemplateContext | undefined = context;

  for (const segment of segments) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }

    current = current[segment];
  }

  if (typeof current === "boolean") {
    return current ? "true" : "false";
  }

  if (typeof current === "object" && current !== null) {
    return undefined;
  }

  return current;
}

function stringifyValue(value: SeoTemplateContextValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

export function renderSeoTemplate(
  template: string | null | undefined,
  context: SeoTemplateContext,
): string {
  if (!template) {
    return "";
  }

  return template.replace(TEMPLATE_TOKEN_PATTERN, (_match, path: string, fallback?: string) => {
    const value = resolvePath(context, path);
    const rendered = stringifyValue(value);

    if (rendered.length > 0) {
      return rendered;
    }

    return fallback?.trim() ?? "";
  });
}

export function extractTemplateTokens(template: string | null | undefined): string[] {
  if (!template) {
    return [];
  }

  const tokens = new Set<string>();
  const matches = template.matchAll(TEMPLATE_TOKEN_PATTERN);

  for (const match of matches) {
    const token = match[0];

    if (token) {
      tokens.add(token);
    }
  }

  return [...tokens];
}
