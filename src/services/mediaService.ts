import { DEFAULT_MEDIA_BUCKET, type AllowedImageMimeType } from "@/constants/media";
import { computeSha256 } from "@/lib/media/hash";
import { processImageBuffer, readImageDimensions } from "@/lib/media/imageProcessing";
import { generateMediaStoragePath, sanitizeFilename } from "@/lib/media/paths";
import { isAllowedImageMimeType, resolveExtension } from "@/lib/media/validation";
import {
  countMediaUsage,
  findMediaAssetByHash,
  findMediaAssetById,
  findMediaAssetRowById,
  findMediaAssets,
  insertMediaAsset,
  softDeleteMediaAsset,
  updateMediaAssetBinary,
  updateMediaAssetMetadata,
} from "@/repositories/mediaRepository";
import { findSettings } from "@/repositories/settingsRepository";
import { downloadObject, removeObject, uploadObject } from "@/repositories/storageRepository";
import { emitWebhookEvent } from "@/services/webhookService";

import type { Pagination } from "@/types";
import type {
  MediaDetail,
  MediaListFilters,
  MediaListItem,
  MediaMetadataInput,
} from "@/types/media";

export interface MediaMutationResult {
  readonly id: string;
  readonly duplicate?: boolean;
}

export interface UploadMediaInput {
  readonly buffer: Buffer;
  readonly mimeType: string;
  readonly originalFilename: string;
  readonly fileSize: number;
}

async function resolveUploadLimits(): Promise<{
  readonly maxBytes: number;
  readonly compressionEnabled: boolean;
  readonly compressionQuality: number;
  readonly convertToWebp: boolean;
  readonly duplicateDetectionEnabled: boolean;
}> {
  const settings = await findSettings();
  const maxUploadSizeMb = settings?.maxUploadSizeMb ?? 25;

  return {
    maxBytes: maxUploadSizeMb * 1024 * 1024,
    compressionEnabled: settings?.imageCompressionEnabled ?? true,
    compressionQuality: settings?.imageCompressionQuality ?? 80,
    convertToWebp: settings?.autoWebpConversion ?? true,
    duplicateDetectionEnabled: settings?.duplicateDetectionEnabled ?? true,
  };
}

async function prepareUploadBuffer(input: UploadMediaInput): Promise<{
  readonly buffer: Buffer;
  readonly mimeType: string;
  readonly extension: string;
  readonly width: number | null;
  readonly height: number | null;
  readonly fileSize: number;
  readonly isOptimized: boolean;
  readonly hasWebp: boolean;
}> {
  const limits = await resolveUploadLimits();

  if (input.fileSize > limits.maxBytes) {
    throw new Error(`File exceeds maximum upload size of ${limits.maxBytes / (1024 * 1024)} MB`);
  }

  if (!limits.compressionEnabled) {
    const dimensions = await readImageDimensions(input.buffer);

    return {
      buffer: input.buffer,
      mimeType: input.mimeType,
      extension: resolveExtension(input.mimeType as AllowedImageMimeType, input.originalFilename),
      width: dimensions.width || null,
      height: dimensions.height || null,
      fileSize: input.fileSize,
      isOptimized: false,
      hasWebp: input.mimeType === "image/webp",
    };
  }

  const processed = await processImageBuffer(input.buffer, {
    quality: limits.compressionQuality,
    convertToWebp: limits.convertToWebp,
  });

  return {
    buffer: processed.buffer,
    mimeType: processed.mimeType,
    extension: processed.extension,
    width: processed.width || null,
    height: processed.height || null,
    fileSize: processed.fileSize,
    isOptimized: true,
    hasWebp: processed.mimeType === "image/webp",
  };
}

export async function listMedia(filters: MediaListFilters): Promise<Pagination<MediaListItem>> {
  return findMediaAssets(filters);
}

export async function getMedia(id: string): Promise<MediaDetail | null> {
  return findMediaAssetById(id);
}

export async function uploadMedia(input: UploadMediaInput): Promise<MediaMutationResult> {
  if (!isAllowedImageMimeType(input.mimeType)) {
    throw new Error("Unsupported file type");
  }

  const limits = await resolveUploadLimits();
  const prepared = await prepareUploadBuffer(input);
  const hash = computeSha256(prepared.buffer);

  if (limits.duplicateDetectionEnabled) {
    const existing = await findMediaAssetByHash(hash);

    if (existing) {
      return { id: existing.id, duplicate: true };
    }
  }

  const storagePath = generateMediaStoragePath(prepared.extension);
  const generatedFilename = storagePath.split("/").pop() ?? `${hash}.${prepared.extension}`;
  const safeOriginalFilename = sanitizeFilename(input.originalFilename);

  await uploadObject({
    bucket: DEFAULT_MEDIA_BUCKET,
    path: storagePath,
    buffer: prepared.buffer,
    contentType: prepared.mimeType,
  });

  try {
    const id = await insertMediaAsset({
      storageBucket: DEFAULT_MEDIA_BUCKET,
      storagePath,
      originalFilename: safeOriginalFilename,
      generatedFilename,
      extension: prepared.extension,
      mimeType: prepared.mimeType,
      fileSize: prepared.fileSize,
      sha256Hash: hash,
      width: prepared.width,
      height: prepared.height,
      isOptimized: prepared.isOptimized,
      hasWebp: prepared.hasWebp,
    });

    emitWebhookEvent("media.uploaded", {
      id,
      mimeType: prepared.mimeType,
      fileSize: prepared.fileSize,
      originalFilename: safeOriginalFilename,
    });

    return { id };
  } catch (error) {
    await removeObject(DEFAULT_MEDIA_BUCKET, storagePath).catch(() => undefined);
    throw error;
  }
}

export async function compressMedia(id: string): Promise<MediaMutationResult> {
  const asset = await findMediaAssetRowById(id);

  if (!asset) {
    throw new Error("Media asset not found");
  }

  if (!isAllowedImageMimeType(asset.mimeType)) {
    throw new Error("Only images can be compressed");
  }

  const settings = await findSettings();
  const originalBuffer = await downloadObject(asset.storageBucket, asset.storagePath);
  const processed = await processImageBuffer(originalBuffer, {
    quality: settings?.imageCompressionQuality ?? 80,
    convertToWebp: settings?.autoWebpConversion ?? true,
  });

  await uploadObject({
    bucket: asset.storageBucket,
    path: asset.storagePath,
    buffer: processed.buffer,
    contentType: processed.mimeType,
    upsert: true,
  });

  const updated = await updateMediaAssetBinary(id, {
    mimeType: processed.mimeType,
    extension: processed.extension,
    fileSize: processed.fileSize,
    sha256Hash: computeSha256(processed.buffer),
    width: processed.width,
    height: processed.height,
    isOptimized: true,
    hasWebp: processed.mimeType === "image/webp",
  });

  if (!updated) {
    throw new Error("Failed to update compressed media");
  }

  return { id };
}

export async function replaceMediaFile(
  id: string,
  input: UploadMediaInput,
): Promise<MediaMutationResult> {
  const asset = await findMediaAssetRowById(id);

  if (!asset) {
    throw new Error("Media asset not found");
  }

  if (!isAllowedImageMimeType(input.mimeType)) {
    throw new Error("Unsupported file type");
  }

  const prepared = await prepareUploadBuffer(input);
  const previousPath = asset.storagePath;

  await uploadObject({
    bucket: asset.storageBucket,
    path: previousPath,
    buffer: prepared.buffer,
    contentType: prepared.mimeType,
    upsert: true,
  });

  const updated = await updateMediaAssetBinary(id, {
    mimeType: prepared.mimeType,
    extension: prepared.extension,
    fileSize: prepared.fileSize,
    sha256Hash: computeSha256(prepared.buffer),
    width: prepared.width,
    height: prepared.height,
    isOptimized: prepared.isOptimized,
    hasWebp: prepared.hasWebp,
    originalFilename: sanitizeFilename(input.originalFilename),
  });

  if (!updated) {
    throw new Error("Failed to update replaced media");
  }

  return { id };
}

export async function updateMediaMetadata(
  id: string,
  input: MediaMetadataInput,
): Promise<MediaMutationResult> {
  const updated = await updateMediaAssetMetadata(id, input);

  if (!updated) {
    throw new Error("Media asset not found");
  }

  return { id: updated.id };
}

export async function deleteMedia(id: string): Promise<void> {
  const asset = await findMediaAssetRowById(id);

  if (!asset) {
    throw new Error("Media asset not found");
  }

  const usageCount = await countMediaUsage(id);

  if (usageCount > 0) {
    throw new Error("Cannot delete media that is still in use");
  }

  const deleted = await softDeleteMediaAsset(id);

  if (!deleted) {
    throw new Error("Failed to delete media asset");
  }

  await removeObject(asset.storageBucket, asset.storagePath).catch(() => undefined);
}
