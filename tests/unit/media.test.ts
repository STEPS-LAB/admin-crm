import { describe, expect, it } from "vitest";

import { generateMediaStoragePath, sanitizeFilename } from "@/lib/media/paths";
import { isAllowedImageMimeType, resolveExtension } from "@/lib/media/validation";
import { mediaUploadSchema } from "@/schemas/media/mediaSchemas";

describe("mediaUploadSchema", () => {
  it("accepts valid image upload metadata", () => {
    const result = mediaUploadSchema.safeParse({
      mimeType: "image/png",
      fileSize: 1024,
      originalFilename: "hero.png",
    });

    expect(result.success).toBe(true);
  });

  it("rejects files over 25 MB", () => {
    const result = mediaUploadSchema.safeParse({
      mimeType: "image/jpeg",
      fileSize: 26 * 1024 * 1024,
      originalFilename: "large.jpg",
    });

    expect(result.success).toBe(false);
  });
});

describe("media validation helpers", () => {
  it("detects allowed mime types", () => {
    expect(isAllowedImageMimeType("image/webp")).toBe(true);
    expect(isAllowedImageMimeType("image/svg+xml")).toBe(false);
  });

  it("resolves extension from filename", () => {
    expect(resolveExtension("image/jpeg", "photo.JPEG")).toBe("jpg");
  });
});

describe("media paths", () => {
  it("generates library path with year and month", () => {
    const path = generateMediaStoragePath("png", new Date("2026-06-15T00:00:00.000Z"));

    expect(path).toMatch(/^library\/2026\/06\/.+\.png$/);
  });

  it("sanitizes unsafe filename characters", () => {
    expect(sanitizeFilename("bad name!!!.png")).toBe("bad name-.png");
  });
});
