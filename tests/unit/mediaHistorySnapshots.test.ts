import { describe, expect, it } from "vitest";

import {
  buildMediaAttachSummary,
  buildMediaDetachSummary,
  mediaCollectionToHistorySnapshot,
} from "@/lib/history/mediaSnapshots";

import type { EntityMediaCollection } from "@/types/entity-media";

const collection: EntityMediaCollection = {
  cover: {
    usageId: "usage-1",
    mediaAssetId: "asset-1",
    usageType: "cover",
    sortOrder: 0,
    originalFilename: "cover.jpg",
    mimeType: "image/jpeg",
    fileSize: 1000,
    altUk: null,
    altEn: null,
    publicUrl: "https://example.com/cover.jpg",
    width: 100,
    height: 100,
  },
  gallery: [
    {
      usageId: "usage-2",
      mediaAssetId: "asset-2",
      usageType: "gallery",
      sortOrder: 0,
      originalFilename: "gallery.jpg",
      mimeType: "image/jpeg",
      fileSize: 2000,
      altUk: null,
      altEn: null,
      publicUrl: "https://example.com/gallery.jpg",
      width: 200,
      height: 200,
    },
  ],
};

describe("mediaCollectionToHistorySnapshot", () => {
  it("stores only history-relevant media fields", () => {
    expect(mediaCollectionToHistorySnapshot(collection)).toEqual({
      cover: {
        usageId: "usage-1",
        mediaAssetId: "asset-1",
        usageType: "cover",
        sortOrder: 0,
        originalFilename: "cover.jpg",
      },
      gallery: [
        {
          usageId: "usage-2",
          mediaAssetId: "asset-2",
          usageType: "gallery",
          sortOrder: 0,
          originalFilename: "gallery.jpg",
        },
      ],
    });
  });
});

describe("media history summaries", () => {
  it("builds attach summaries", () => {
    expect(buildMediaAttachSummary("cover", "cover.jpg")).toBe('Set "cover.jpg" as cover image');
    expect(buildMediaAttachSummary("gallery", "photo.jpg")).toBe('Added "photo.jpg" to gallery');
  });

  it("builds detach summaries", () => {
    expect(buildMediaDetachSummary("cover", "cover.jpg")).toBe('Removed cover image "cover.jpg"');
    expect(buildMediaDetachSummary("gallery", "photo.jpg")).toBe('Removed "photo.jpg" from gallery');
  });
});
