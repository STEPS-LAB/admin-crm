export function countRichTextWords(html: string | null | undefined): number {
  if (!html) {
    return 0;
  }

  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return 0;
  }

  return text.split(" ").length;
}

export function countRichTextCharacters(html: string | null | undefined): number {
  if (!html) {
    return 0;
  }

  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length;
}
