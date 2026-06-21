export const DEFAULT_MEDIA_BUCKET = "media";

export const MAX_MEDIA_UPLOAD_BYTES = 25 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif", "avif"] as const;

export const MIME_TO_EXTENSION: Record<AllowedImageMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export const MEDIA_LIBRARY_FILTERS = ["all", "unused"] as const;

export type MediaLibraryFilter = (typeof MEDIA_LIBRARY_FILTERS)[number];
