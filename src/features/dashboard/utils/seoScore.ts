export type SeoScoreBand = "critical" | "poor" | "fair" | "good" | "excellent";

export interface SeoScoreColor {
  readonly band: SeoScoreBand;
  readonly stroke: string;
  readonly text: string;
  readonly progress: string;
}

const SCORE_BANDS: Array<{ max: number; band: SeoScoreBand; stroke: string; text: string; progress: string }> = [
  { max: 39, band: "critical", stroke: "text-destructive", text: "text-destructive", progress: "bg-destructive" },
  { max: 59, band: "poor", stroke: "text-orange-500", text: "text-orange-500", progress: "bg-orange-500" },
  { max: 79, band: "fair", stroke: "text-yellow-500", text: "text-yellow-600", progress: "bg-yellow-500" },
  { max: 89, band: "good", stroke: "text-green-500", text: "text-green-600", progress: "bg-green-500" },
  { max: 100, band: "excellent", stroke: "text-emerald-500", text: "text-emerald-600", progress: "bg-emerald-500" },
];

export function getSeoScoreColor(score: number): SeoScoreColor {
  const clamped = Math.max(0, Math.min(100, score));
  const band = SCORE_BANDS.find((entry) => clamped <= entry.max) ?? SCORE_BANDS[SCORE_BANDS.length - 1]!;

  return {
    band: band.band,
    stroke: band.stroke,
    text: band.text,
    progress: band.progress,
  };
}

export function getSeoScoreLabel(band: SeoScoreBand): string {
  switch (band) {
    case "critical":
      return "Critical";
    case "poor":
      return "Needs work";
    case "fair":
      return "Fair";
    case "good":
      return "Good";
    case "excellent":
      return "Excellent";
  }
}
