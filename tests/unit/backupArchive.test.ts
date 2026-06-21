import { describe, expect, it } from "vitest";

import { parseBackupArchive, serializeBackupSnapshot } from "@/lib/backup/archive";

describe("backup archive", () => {
  it("round-trips snapshot data with checksum validation", () => {
    const dataParts = {
      settings: { siteName: "SEO CMS", siteUrl: "https://example.com" },
      redirectRules: [{ source: "/old", destination: "/new", statusCode: "301", enabled: true }],
      seoTemplates: [],
      featureFlagInstallations: [{ slug: "public-api-v1", enabled: true }],
      sitemapConfig: [],
      robotsConfig: [],
      counts: { products: 1 },
    };

    const archive = serializeBackupSnapshot(dataParts, "full", false);
    const parsed = parseBackupArchive(archive.buffer, false);

    expect(parsed.settings).toEqual(dataParts.settings);
    expect(parsed.redirectRules).toHaveLength(1);
    expect(parsed.manifest.backupType).toBe("full");
  });

  it("supports encrypted archives", () => {
    const dataParts = {
      settings: null,
      redirectRules: [],
      seoTemplates: [],
      featureFlagInstallations: [],
      sitemapConfig: [],
      robotsConfig: [],
    };

    const archive = serializeBackupSnapshot(dataParts, "metadata", true);
    const parsed = parseBackupArchive(archive.buffer, true);

    expect(parsed.manifest.backupType).toBe("metadata");
    expect(archive.encrypted).toBe(true);
  });
});
