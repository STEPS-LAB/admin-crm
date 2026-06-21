export interface SeoScoreBreakdown {
  readonly overall: number;
  readonly technical: number;
  readonly metadata: number;
  readonly schema: number;
  readonly content: number;
  readonly images: number;
  readonly performance: number;
  readonly accessibility: number;
}

export interface SeoScore extends SeoScoreBreakdown {
  readonly warnings: string[];
  readonly errors: string[];
  readonly recommendations: string[];
  readonly lastScanAt: Date | null;
}
