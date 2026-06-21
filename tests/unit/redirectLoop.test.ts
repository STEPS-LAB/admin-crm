import { describe, expect, it } from "vitest";

import { wouldCreateRedirectLoop } from "@/lib/seo/redirectLoop";

describe("wouldCreateRedirectLoop", () => {
  const redirects = new Map<string, { id: string; destination: string; enabled: boolean }>([
    ["/a", { id: "1", destination: "/b", enabled: true }],
    ["/b", { id: "2", destination: "/c", enabled: true }],
    ["/c", { id: "3", destination: "/a", enabled: true }],
    ["/disabled", { id: "4", destination: "/loop", enabled: false }],
  ]);

  const resolveNext = async (path: string) => redirects.get(path) ?? null;

  it("returns false for external destination", async () => {
    const result = await wouldCreateRedirectLoop("/x", "https://example.com", resolveNext);

    expect(result).toBe(false);
  });

  it("detects direct loop back to source", async () => {
    const result = await wouldCreateRedirectLoop("/x", "/x", resolveNext);

    expect(result).toBe(true);
  });

  it("detects indirect redirect chain loop", async () => {
    const result = await wouldCreateRedirectLoop("/start", "/a", resolveNext);

    expect(result).toBe(true);
  });

  it("returns false when chain ends without loop", async () => {
    const result = await wouldCreateRedirectLoop("/only", "/dead-end", resolveNext);

    expect(result).toBe(false);
  });

  it("ignores disabled redirects in chain", async () => {
    const result = await wouldCreateRedirectLoop("/start", "/disabled", resolveNext);

    expect(result).toBe(false);
  });

  it("excludes redirect being edited from chain", async () => {
    const result = await wouldCreateRedirectLoop("/start", "/b", resolveNext, "2");

    expect(result).toBe(false);
  });
});
