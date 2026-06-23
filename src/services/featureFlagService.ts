import {
  BUNDLED_FEATURE_FLAGS,
  type BundledFeatureFlagDefinition,
} from "@/constants/feature-flags";
import {
  findFeatureFlagInstallationBySlug,
  findFeatureFlagInstallations,
  upsertFeatureFlagInstallation,
} from "@/repositories/featureFlagRepository";
import { getAuthenticatedUser } from "@/lib/auth/cachedAuthenticatedUser";
import { recordEntityUpdate, type HistoryMutationContext } from "@/services/historyService";

import type { AuthUser } from "@/types/auth";
import type {
  FeatureFlagCenterOverview,
  FeatureFlagListFilters,
  FeatureFlagListItem,
  ToggleFeatureFlagResult,
} from "@/types/feature-flags";

async function requireAuthenticatedUser(): Promise<AuthUser> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

function getFeatureFlagDefinition(slug: string): BundledFeatureFlagDefinition | undefined {
  return BUNDLED_FEATURE_FLAGS.find((flag) => flag.slug === slug);
}

function mapFeatureFlagItem(
  definition: BundledFeatureFlagDefinition,
  installation: { enabled: boolean; installedAt: Date; updatedAt: Date } | undefined,
): FeatureFlagListItem {
  let enabled = definition.defaultEnabled;

  if (definition.availability === "coming_soon") {
    enabled = false;
  } else if (installation) {
    enabled = installation.enabled;
  }

  return {
    slug: definition.slug,
    name: definition.name,
    description: definition.description,
    environment: definition.environment,
    availability: definition.availability,
    enabled,
    installedAt: installation?.installedAt ?? null,
    updatedAt: installation?.updatedAt ?? null,
  };
}

function matchesFilters(item: FeatureFlagListItem, filters: FeatureFlagListFilters): boolean {
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

export async function getFeatureFlagCenterOverview(): Promise<FeatureFlagCenterOverview> {
  await requireAuthenticatedUser();

  const installations = await findFeatureFlagInstallations();
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

  const items = BUNDLED_FEATURE_FLAGS.map((definition) =>
    mapFeatureFlagItem(definition, installationMap.get(definition.slug)),
  );

  return {
    totalFlags: items.length,
    enabledCount: items.filter((item) => item.enabled).length,
    disabledCount: items.filter((item) => !item.enabled && item.availability === "bundled").length,
    bundledCount: items.filter((item) => item.availability === "bundled").length,
    comingSoonCount: items.filter((item) => item.availability === "coming_soon").length,
  };
}

export async function listFeatureFlags(
  filters: FeatureFlagListFilters = {},
): Promise<FeatureFlagListItem[]> {
  await requireAuthenticatedUser();

  const installations = await findFeatureFlagInstallations();
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

  return BUNDLED_FEATURE_FLAGS.map((definition) =>
    mapFeatureFlagItem(definition, installationMap.get(definition.slug)),
  ).filter((item) => matchesFilters(item, filters));
}

export async function toggleFeatureFlag(
  slug: string,
  enabled: boolean,
  context: HistoryMutationContext,
): Promise<ToggleFeatureFlagResult> {
  await requireAuthenticatedUser();

  const definition = getFeatureFlagDefinition(slug);

  if (!definition) {
    throw new Error("Feature flag not found");
  }

  if (definition.availability === "coming_soon") {
    throw new Error("Feature flag is not available yet");
  }

  const previous = await findFeatureFlagInstallationBySlug(slug);
  const previousEnabled = previous?.enabled ?? definition.defaultEnabled;

  if (previousEnabled === enabled) {
    return { slug, enabled };
  }

  const updated = await upsertFeatureFlagInstallation({ slug, enabled });

  await recordEntityUpdate(
    "system",
    updated.id,
    `Feature flag "${definition.name}" ${enabled ? "enabled" : "disabled"}`,
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

export async function isFeatureFlagEnabled(slug: string): Promise<boolean> {
  const definition = getFeatureFlagDefinition(slug);

  if (!definition || definition.availability === "coming_soon") {
    return false;
  }

  const installation = await findFeatureFlagInstallationBySlug(slug);

  if (installation) {
    return installation.enabled;
  }

  return definition.defaultEnabled;
}
