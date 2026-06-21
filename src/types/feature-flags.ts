import type { FeatureFlagAvailability, FeatureFlagEnvironment } from "@/constants/feature-flags";

export interface FeatureFlagListItem {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly environment: FeatureFlagEnvironment;
  readonly availability: FeatureFlagAvailability;
  readonly enabled: boolean;
  readonly installedAt: Date | null;
  readonly updatedAt: Date | null;
}

export interface FeatureFlagCenterOverview {
  readonly totalFlags: number;
  readonly enabledCount: number;
  readonly disabledCount: number;
  readonly bundledCount: number;
  readonly comingSoonCount: number;
}

export interface FeatureFlagListFilters {
  readonly status?: "enabled" | "disabled";
  readonly search?: string;
}

export interface ToggleFeatureFlagResult {
  readonly slug: string;
  readonly enabled: boolean;
}
