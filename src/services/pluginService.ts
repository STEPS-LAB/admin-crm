import { BUNDLED_PLUGINS, type BundledPluginDefinition } from "@/constants/plugins";
import {
  findPluginInstallationBySlug,
  findPluginInstallations,
  upsertPluginInstallation,
} from "@/repositories/pluginRepository";
import { getAuthenticatedUser } from "@/lib/auth/cachedAuthenticatedUser";
import { recordEntityUpdate } from "@/services/historyService";

import type { AuthUser } from "@/types/auth";
import type {
  PluginCenterOverview,
  PluginListFilters,
  PluginListItem,
  TogglePluginResult,
} from "@/types/plugins";
import type { HistoryMutationContext } from "@/services/historyService";

async function requireAuthenticatedUser(): Promise<AuthUser> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

function getPluginDefinition(slug: string): BundledPluginDefinition | undefined {
  return BUNDLED_PLUGINS.find((plugin) => plugin.slug === slug);
}

function mapPluginItem(
  definition: BundledPluginDefinition,
  installation: { enabled: boolean; installedAt: Date; updatedAt: Date } | undefined,
): PluginListItem {
  let enabled = definition.defaultEnabled;

  if (definition.isCore) {
    enabled = true;
  } else if (definition.availability === "coming_soon") {
    enabled = false;
  } else if (installation) {
    enabled = installation.enabled;
  }

  return {
    slug: definition.slug,
    name: definition.name,
    description: definition.description,
    type: definition.type,
    version: definition.version,
    availability: definition.availability,
    isCore: definition.isCore,
    enabled,
    installedAt: installation?.installedAt ?? null,
    updatedAt: installation?.updatedAt ?? null,
  };
}

function matchesFilters(item: PluginListItem, filters: PluginListFilters): boolean {
  if (filters.type && item.type !== filters.type) {
    return false;
  }

  if (filters.status === "enabled" && !item.enabled) {
    return false;
  }

  if (filters.status === "disabled" && item.enabled) {
    return false;
  }

  if (filters.search) {
    const term = filters.search.toLowerCase();
    const haystack = `${item.name} ${item.description} ${item.slug}`.toLowerCase();

    if (!haystack.includes(term)) {
      return false;
    }
  }

  return true;
}

export async function getPluginCenterOverview(): Promise<PluginCenterOverview> {
  await requireAuthenticatedUser();

  const installations = await findPluginInstallations();
  const installationMap = new Map(
    installations.map((installation) => [
      installation.slug,
      {
        enabled: installation.enabled,
        installedAt: installation.installedAt,
        updatedAt: installation.updatedAt,
      },
    ]),
  );

  const items = BUNDLED_PLUGINS.map((definition) =>
    mapPluginItem(definition, installationMap.get(definition.slug)),
  );

  return {
    totalPlugins: items.length,
    enabledCount: items.filter((item) => item.enabled).length,
    disabledCount: items.filter((item) => !item.enabled && item.availability === "bundled").length,
    bundledCount: items.filter((item) => item.availability === "bundled").length,
    comingSoonCount: items.filter((item) => item.availability === "coming_soon").length,
    coreCount: items.filter((item) => item.isCore).length,
  };
}

export async function listPlugins(filters: PluginListFilters = {}): Promise<PluginListItem[]> {
  await requireAuthenticatedUser();

  const installations = await findPluginInstallations();
  const installationMap = new Map(
    installations.map((installation) => [
      installation.slug,
      {
        enabled: installation.enabled,
        installedAt: installation.installedAt,
        updatedAt: installation.updatedAt,
      },
    ]),
  );

  return BUNDLED_PLUGINS.map((definition) =>
    mapPluginItem(definition, installationMap.get(definition.slug)),
  ).filter((item) => matchesFilters(item, filters));
}

export async function togglePlugin(
  slug: string,
  enabled: boolean,
  context: HistoryMutationContext,
): Promise<TogglePluginResult> {
  await requireAuthenticatedUser();

  const definition = getPluginDefinition(slug);

  if (!definition) {
    throw new Error("Plugin not found");
  }

  if (definition.isCore) {
    throw new Error("Core plugins cannot be disabled");
  }

  if (definition.availability === "coming_soon") {
    throw new Error("Plugin is not available yet");
  }

  const previous = await findPluginInstallationBySlug(slug);
  const previousEnabled = previous?.enabled ?? definition.defaultEnabled;

  if (previousEnabled === enabled) {
    return { slug, enabled };
  }

  const updated = await upsertPluginInstallation({ slug, enabled });

  await recordEntityUpdate(
    "system",
    updated.id,
    `Plugin "${definition.name}" ${enabled ? "enabled" : "disabled"}`,
    {
      slug: updated.slug,
      name: definition.name,
      enabled: previousEnabled,
    },
    {
      slug: updated.slug,
      name: definition.name,
      enabled: updated.enabled,
    },
    context,
  );

  return {
    slug: updated.slug,
    enabled: updated.enabled,
  };
}
