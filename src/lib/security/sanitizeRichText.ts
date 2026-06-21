import DOMPurify, { type Config } from "isomorphic-dompurify";

import { normalizeRichTextValue } from "@/lib/security/richText";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "a",
  "hr",
] as const;

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [...ALLOWED_TAGS],
  ALLOWED_ATTR: ["href", "target", "rel", "class"],
  ALLOW_DATA_ATTR: false,
} satisfies Config;

export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG).trim();
}

export function sanitizeRichTextInput(value: string | null | undefined): string | null {
  const normalized = normalizeRichTextValue(value);

  if (!normalized) {
    return null;
  }

  return sanitizeRichText(normalized);
}
