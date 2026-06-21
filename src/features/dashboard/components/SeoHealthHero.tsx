"use client";

import Link from "next/link";

import { getSeoScoreColor, getSeoScoreLabel } from "@/features/dashboard/utils/seoScore";
import { cn } from "@/lib/utils/cn";

import type { SeoHealthSummary } from "@/types/dashboard";

export interface SeoHealthHeroProps {
  readonly health: SeoHealthSummary;
}

const CIRCLE_RADIUS = 54;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export function SeoHealthHero({ health }: SeoHealthHeroProps): React.JSX.Element {
  const hasData = health.profileCount > 0;
  const score = health.overallScore;
  const colors = getSeoScoreColor(score);
  const progress = hasData ? (score / 100) * CIRCLE_CIRCUMFERENCE : 0;
  const formattedScan = health.lastScanAt
    ? new Intl.DateTimeFormat("uk-UA", { dateStyle: "medium", timeStyle: "short" }).format(
        health.lastScanAt,
      )
    : "No scans yet";

  const content = (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative mx-auto flex h-40 w-40 items-center justify-center sm:mx-0">
        <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
          <circle
            cx="60"
            cy="60"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-muted/60"
          />
          <circle
            cx="60"
            cy="60"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={CIRCLE_CIRCUMFERENCE - progress}
            className={cn(colors.stroke, "transition-[stroke-dashoffset] duration-700 ease-out")}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={cn("text-4xl font-semibold tracking-tight", colors.text)}>
            {hasData ? score : "—"}
          </span>
          <span className="text-xs text-muted-foreground">SEO Health</span>
        </div>
      </div>

      <div className="flex-1 space-y-3 text-center sm:text-left">
        <div>
          <p className="text-sm text-muted-foreground">Overall score</p>
          <p className={cn("text-lg font-semibold", hasData ? colors.text : "text-muted-foreground")}>
            {hasData ? getSeoScoreLabel(colors.band) : "Awaiting analysis"}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">Last analysis: {formattedScan}</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm sm:justify-start">
          <span className="text-destructive">{health.criticalIssues} critical</span>
          <span className="text-yellow-600">{health.warnings} warnings</span>
          <span className="text-muted-foreground">{health.recommendations} recommendations</span>
        </div>
      </div>
    </div>
  );

  if (!hasData) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {content}
        <p className="mt-4 text-center text-sm text-muted-foreground sm:text-left">
          Run SEO analysis from SEO Center once profiles are configured.
        </p>
      </div>
    );
  }

  return (
    <Link
      href="/admin/seo"
      className="block rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Open SEO Center analysis"
    >
      {content}
    </Link>
  );
}
