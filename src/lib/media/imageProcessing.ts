import sharp from "sharp";

import type { AllowedImageMimeType } from "@/constants/media";

export interface ProcessedImageResult {
  readonly buffer: Buffer;
  readonly mimeType: AllowedImageMimeType;
  readonly extension: string;
  readonly width: number;
  readonly height: number;
  readonly fileSize: number;
}

export interface ImageProcessingOptions {
  readonly quality: number;
  readonly convertToWebp: boolean;
}

const DEFAULT_OPTIONS: ImageProcessingOptions = {
  quality: 80,
  convertToWebp: true,
};

function isGif(buffer: Buffer): boolean {
  return buffer.length >= 3 && buffer.subarray(0, 3).toString("ascii") === "GIF";
}

export async function processImageBuffer(
  buffer: Buffer,
  options: Partial<ImageProcessingOptions> = {},
): Promise<ProcessedImageResult> {
  const resolved = { ...DEFAULT_OPTIONS, ...options };

  if (isGif(buffer)) {
    const metadata = await sharp(buffer, { animated: true }).metadata();

    return {
      buffer,
      mimeType: "image/gif",
      extension: "gif",
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      fileSize: buffer.byteLength,
    };
  }

  const pipeline = sharp(buffer).rotate();

  if (resolved.convertToWebp) {
    const output = await pipeline
      .webp({ quality: resolved.quality })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: output.data,
      mimeType: "image/webp",
      extension: "webp",
      width: output.info.width,
      height: output.info.height,
      fileSize: output.data.byteLength,
    };
  }

  const output = await pipeline
    .jpeg({ quality: resolved.quality, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: output.data,
    mimeType: "image/jpeg",
    extension: "jpg",
    width: output.info.width,
    height: output.info.height,
    fileSize: output.data.byteLength,
  };
}

export async function readImageDimensions(
  buffer: Buffer,
): Promise<{ readonly width: number; readonly height: number }> {
  const metadata = await sharp(buffer).metadata();

  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}
