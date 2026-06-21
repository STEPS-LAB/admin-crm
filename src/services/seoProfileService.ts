import { getEntityAdminHref } from "@/lib/seo/entityLinks";
import {
  ensureOwnerSeoProfiles,
  findSeoProfileById,
  findSeoProfiles,
  findSeoProfilesByOwner,
  updateSeoProfileMetadata as persistSeoProfileMetadata,
  type OwnerSeoProfileLabels,
} from "@/repositories/seoProfileRepository";

import type { Pagination } from "@/types";
import type { SeoOwnerType } from "@/constants/seo";
import type {
  EntitySeoProfiles,
  SeoMetadataInput,
  SeoProfileDetail,
  SeoProfileListFilters,
  SeoProfileListItem,
} from "@/types/seo-center";

export interface SeoProfileMutationResult {
  readonly id: string;
}

function enrichListItem(item: SeoProfileListItem): SeoProfileListItem {
  return {
    ...item,
    entityHref: getEntityAdminHref(item.ownerType, item.ownerId),
  };
}

function enrichDetail(profile: SeoProfileDetail): SeoProfileDetail {
  return {
    ...profile,
    entityHref: getEntityAdminHref(profile.ownerType, profile.ownerId),
  };
}

export async function listSeoProfiles(
  filters: SeoProfileListFilters,
): Promise<Pagination<SeoProfileListItem>> {
  const pagination = await findSeoProfiles(filters);

  return {
    ...pagination,
    items: pagination.items.map(enrichListItem),
  };
}

export async function getSeoProfile(id: string): Promise<SeoProfileDetail | null> {
  const profile = await findSeoProfileById(id);

  if (!profile) {
    return null;
  }

  return enrichDetail(profile);
}

export async function getOwnerSeoProfiles(
  ownerType: SeoOwnerType,
  ownerId: string,
  labels: OwnerSeoProfileLabels,
): Promise<EntitySeoProfiles> {
  await ensureOwnerSeoProfiles(ownerType, ownerId, labels);

  const profiles = await findSeoProfilesByOwner(ownerType, ownerId);
  const uk = profiles.find((profile) => profile.language === "uk");
  const en = profiles.find((profile) => profile.language === "en");

  if (!uk || !en) {
    throw new Error("SEO profiles are incomplete for this entity");
  }

  return {
    uk: enrichDetail(uk),
    en: enrichDetail(en),
  };
}

export async function updateSeoProfileMetadata(
  id: string,
  input: SeoMetadataInput,
): Promise<SeoProfileMutationResult> {
  const profile = await findSeoProfileById(id);

  if (!profile) {
    throw new Error("SEO profile not found");
  }

  await persistSeoProfileMetadata(id, input);

  return { id };
}
