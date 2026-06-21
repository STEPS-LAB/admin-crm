import { getEntityAdminHref } from "@/lib/seo/entityLinks";
import {
  deleteInternalLinkById,
  findAllManualInternalLinkSources,
  findEntityLabel,
  findInternalLinkTargets,
  findInternalLinksByProfileId,
  insertInternalLink,
} from "@/repositories/internalLinkRepository";
import { findSeoProfileById } from "@/repositories/seoProfileRepository";

import type {
  InternalLinkFormInput,
  InternalLinkListItem,
  InternalLinkTargetOption,
} from "@/types/seo-templates";

export interface InternalLinkMutationResult {
  readonly id: string;
}

function resolveSourceLabel(row: {
  sourceProductName: string | null;
  sourceCategoryName: string | null;
  sourcePageTitle: string | null;
  sourceBrandName: string | null;
  metaTitle: string | null;
  sourceOwnerType: string;
  sourceOwnerId: string;
}): string {
  return (
    row.sourceProductName ??
    row.sourceCategoryName ??
    row.sourcePageTitle ??
    row.sourceBrandName ??
    row.metaTitle ??
    `${row.sourceOwnerType} ${row.sourceOwnerId.slice(0, 8)}`
  );
}

export async function listInternalLinksByProfile(
  seoProfileId: string,
): Promise<InternalLinkListItem[]> {
  const profile = await findSeoProfileById(seoProfileId);

  if (!profile) {
    throw new Error("SEO profile not found");
  }

  const rows = await findInternalLinksByProfileId(seoProfileId);

  const items = await Promise.all(
    rows.map(async (row) => {
      const targetLabel =
        (await findEntityLabel(row.targetOwnerType, row.targetOwnerId, profile.language)) ??
        `${row.targetOwnerType} ${row.targetOwnerId.slice(0, 8)}`;

      return {
        id: row.id,
        seoProfileId: row.seoProfileId,
        sourceLabel: profile.entityLabel,
        sourceOwnerType: profile.ownerType,
        sourceLanguage: profile.language,
        targetOwnerType: row.targetOwnerType,
        targetOwnerId: row.targetOwnerId,
        targetLabel,
        anchorText: row.anchorText,
        sortOrder: row.sortOrder,
        isAutomatic: row.isAutomatic,
        updatedAt: row.updatedAt,
        targetHref: getEntityAdminHref(row.targetOwnerType, row.targetOwnerId),
        sourceHref: profile.entityHref,
      };
    }),
  );

  return items;
}

export async function listAllManualInternalLinks(): Promise<InternalLinkListItem[]> {
  const rows = await findAllManualInternalLinkSources();

  return Promise.all(
    rows.map(async (row) => {
      const targetLabel =
        (await findEntityLabel(row.targetOwnerType, row.targetOwnerId, row.sourceLanguage)) ??
        `${row.targetOwnerType} ${row.targetOwnerId.slice(0, 8)}`;

      return {
        id: row.id,
        seoProfileId: row.seoProfileId,
        sourceLabel: resolveSourceLabel(row),
        sourceOwnerType: row.sourceOwnerType,
        sourceLanguage: row.sourceLanguage,
        targetOwnerType: row.targetOwnerType,
        targetOwnerId: row.targetOwnerId,
        targetLabel,
        anchorText: row.anchorText,
        sortOrder: row.sortOrder,
        isAutomatic: row.isAutomatic,
        updatedAt: row.updatedAt,
        targetHref: getEntityAdminHref(row.targetOwnerType, row.targetOwnerId),
        sourceHref: `/admin/seo/profiles/${row.seoProfileId}`,
      };
    }),
  );
}

export async function createInternalLink(
  input: InternalLinkFormInput,
): Promise<InternalLinkMutationResult> {
  const profile = await findSeoProfileById(input.seoProfileId);

  if (!profile) {
    throw new Error("SEO profile not found");
  }

  if (profile.ownerId === input.targetOwnerId && profile.ownerType === input.targetOwnerType) {
    throw new Error("Cannot link a profile to itself");
  }

  const id = await insertInternalLink(input);
  return { id };
}

export async function deleteInternalLink(id: string): Promise<void> {
  const deleted = await deleteInternalLinkById(id);

  if (!deleted) {
    throw new Error("Internal link not found");
  }
}

export async function searchInternalLinkTargets(
  search: string,
): Promise<InternalLinkTargetOption[]> {
  return findInternalLinkTargets(search);
}
