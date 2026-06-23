const ALLOWED_TAGS = new Set([
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
]);

const TAG_PATTERN = /<\/?([a-z0-9]+)([^>]*)>/gi;

function sanitizeAnchorTag(attributes: string): string {
  const safeAttributes = attributes
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\sstyle\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  const hrefMatch = safeAttributes.match(/\shref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);

  if (!hrefMatch) {
    return safeAttributes.trim().length > 0 ? `<a${safeAttributes}>` : "<a>";
  }

  const href = (hrefMatch[2] ?? hrefMatch[3] ?? hrefMatch[4] ?? "").trim().toLowerCase();

  if (href.startsWith("javascript:") || href.startsWith("data:")) {
    return "<a>";
  }

  return `<a${safeAttributes}>`;
}

function sanitizeTag(match: string, rawTagName: string, attributes: string): string {
  const tagName = rawTagName.toLowerCase();
  const isClosingTag = match.startsWith("</");

  if (!ALLOWED_TAGS.has(tagName)) {
    return "";
  }

  if (isClosingTag) {
    return `</${tagName}>`;
  }

  if (tagName === "a") {
    return sanitizeAnchorTag(attributes);
  }

  if (attributes.trim().length > 0) {
    return `<${tagName}>`;
  }

  return `<${tagName}>`;
}

export function sanitizePublicRichText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(TAG_PATTERN, sanitizeTag)
    .trim();
}
