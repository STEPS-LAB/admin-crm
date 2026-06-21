import { describe, expect, it } from "vitest";

import { getSeoScoreColor, getSeoScoreLabel } from "@/features/dashboard/utils/seoScore";

describe("seoScore utilities", () => {
  it("maps score bands to SRS color thresholds", () => {
    expect(getSeoScoreColor(25).band).toBe("critical");
    expect(getSeoScoreColor(50).band).toBe("poor");
    expect(getSeoScoreColor(70).band).toBe("fair");
    expect(getSeoScoreColor(85).band).toBe("good");
    expect(getSeoScoreColor(95).band).toBe("excellent");
  });

  it("clamps scores outside 0-100", () => {
    expect(getSeoScoreColor(-5).band).toBe("critical");
    expect(getSeoScoreColor(150).band).toBe("excellent");
  });

  it("returns human-readable labels", () => {
    expect(getSeoScoreLabel("excellent")).toBe("Excellent");
    expect(getSeoScoreLabel("critical")).toBe("Critical");
  });
});
