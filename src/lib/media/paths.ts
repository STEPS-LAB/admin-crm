import { randomUUID } from "node:crypto";

export function generateMediaStoragePath(extension: string, date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const filename = `${randomUUID()}.${extension}`;

  return `library/${year}/${month}/${filename}`;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .trim()
    .replace(/[^\w.\-() ]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 255);
}
