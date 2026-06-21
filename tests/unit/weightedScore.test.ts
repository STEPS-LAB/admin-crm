import { describe, expect, it } from "vitest";

import { calculateWeightedGlobalScore } from "@/lib/seo/weightedScore";

import type { SeoEntityScore } from "@/types/seo-center";

describe("calculateWeightedGlobalScore", () => {
  it("returns weighted average for configured entity types", () => {
    const entities: SeoEntityScore[] = [
      { ownerType: "product", label: "Product", profileCount: 2, averageScore: 80 },
      { ownerType: "category", label: "Category", profileCount: 1, averageScore: 60 },
      { ownerType: "tag", label: "Tag", profileCount: 5, averageScore: 100 },
    ];

    const score = calculateWeightedGlobalScore(entities);

    // (80*0.3 + 60*0.15) / (0.3 + 0.15) = 33 / 0.45 = 73.33 -> 73
    expect(score).toBe(73);
  });

  it("returns 0 when no weighted entities have profiles", () => {
    const entities: SeoEntityScore[] = [
      { ownerType: "tag", label: "Tag", profileCount: 3, averageScore: 90 },
    ];

    expect(calculateWeightedGlobalScore(entities)).toBe(0);
  });

  it("returns 0 for empty input", () => {
    expect(calculateWeightedGlobalScore([])).toBe(0);
  });
});
