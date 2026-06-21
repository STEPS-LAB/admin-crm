import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  MIME_TO_EXTENSION,
  type AllowedImageMimeType,
} from "@/constants/media";

export function isAllowedImageMimeType(mimeType: string): mimeType is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function resolveExtension(mimeType: AllowedImageMimeType, originalFilename: string): string {
  const fromMime = MIME_TO_EXTENSION[mimeType];
  const fromName = originalFilename.split(".").pop()?.toLowerCase();

  if (fromName && (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  return fromMime;
}
