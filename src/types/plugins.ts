import type { PluginAvailability, PluginType } from "@/constants/plugins";

export interface PluginListItem {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly type: PluginType;
  readonly version: string;
  readonly availability: PluginAvailability;
  readonly isCore: boolean;
  readonly enabled: boolean;
  readonly installedAt: Date | null;
  readonly updatedAt: Date | null;
}

export interface PluginCenterOverview {
  readonly totalPlugins: number;
  readonly enabledCount: number;
  readonly disabledCount: number;
  readonly bundledCount: number;
  readonly comingSoonCount: number;
  readonly coreCount: number;
}

export interface PluginListFilters {
  readonly type?: PluginType;
  readonly status?: "enabled" | "disabled";
  readonly search?: string;
}

export interface TogglePluginResult {
  readonly slug: string;
  readonly enabled: boolean;
}
