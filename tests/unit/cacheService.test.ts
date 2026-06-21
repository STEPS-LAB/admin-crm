import { describe, expect, it, vi, beforeEach } from "vitest";

const revalidateTag = vi.fn();
const revalidatePath = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag,
  revalidatePath,
}));

describe("clearApplicationCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revalidates seo tags and public paths for seo scope", async () => {
    const { clearApplicationCache } = await import("@/services/cacheService");

    const result = await clearApplicationCache("seo");

    expect(result.scope).toBe("seo");
    expect(result.clearedTags).toContain("seo");
    expect(result.clearedTags).toContain("sitemap");
    expect(revalidateTag).toHaveBeenCalledWith("seo");
    expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
    expect(revalidatePath).toHaveBeenCalledWith("/robots.txt");
  });

  it("revalidates all tag groups for all scope", async () => {
    const { clearApplicationCache } = await import("@/services/cacheService");

    const result = await clearApplicationCache("all");

    expect(result.clearedTags.length).toBeGreaterThan(4);
    expect(revalidatePath).toHaveBeenCalledWith("/admin/media");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/settings");
  });
});
