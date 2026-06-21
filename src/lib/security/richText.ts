function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function isEmptyRichText(html: string | null | undefined): boolean {
  if (!html) {
    return true;
  }

  const trimmed = html.trim();

  return trimmed.length === 0 || trimmed === "<p></p>" || trimmed === "<p><br></p>";
}

export function normalizeRichTextValue(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();

  if (isEmptyRichText(trimmed)) {
    return null;
  }

  return trimmed;
}

export function toEditorHtml(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("<")) {
    return trimmed;
  }

  return `<p>${escapeHtml(trimmed)}</p>`;
}
