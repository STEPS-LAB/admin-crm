import {
  entityDisplayName,
  pageDetailToHistorySnapshot,
  pageFormToHistorySnapshot,
} from "@/lib/history/snapshots";
import {
  findPageById,
  findPages,
  insertPage,
  slugExists,
  softDeletePage,
  updatePageRecord,
  updatePageStatus,
} from "@/repositories/pageRepository";
import {
  assertPageCanPublish,
  assertPageStatusCanPublish,
  provisionPageSeoProfiles,
} from "@/services/publishValidationService";
import {
  recordEntityCreate,
  recordEntityDelete,
  recordEntityStatusChange,
  recordEntityUpdate,
  type HistoryMutationContext,
} from "@/services/historyService";

import type { Pagination } from "@/types";
import type { PageDetail, PageFormInput, PageListFilters, PageListItem } from "@/types/pages";
import type { PageStatus } from "@/constants/pages";

export interface PageMutationResult {
  readonly id: string;
}

function pageFormInputFromDetail(detail: PageDetail): PageFormInput {
  return {
    pageType: detail.pageType,
    status: detail.status,
    isHomepage: detail.isHomepage,
    sortOrder: detail.sortOrder,
    translations: detail.translations,
  };
}

async function validateUniqueSlugs(
  input: PageFormInput,
  excludePageId?: string,
): Promise<string | null> {
  for (const language of ["uk", "en"] as const) {
    const slug = input.translations[language].slug;

    if (await slugExists(language, slug, excludePageId)) {
      return `Slug "${slug}" already exists for ${language.toUpperCase()}`;
    }
  }

  return null;
}

export async function listPages(filters: PageListFilters): Promise<Pagination<PageListItem>> {
  return findPages(filters);
}

export async function getPage(id: string): Promise<PageDetail | null> {
  return findPageById(id);
}

export async function createPage(
  input: PageFormInput,
  context: HistoryMutationContext,
): Promise<PageMutationResult> {
  const slugError = await validateUniqueSlugs(input);

  if (slugError) {
    throw new Error(slugError);
  }

  const id = await insertPage(input);

  await provisionPageSeoProfiles(id, {
    uk: input.translations.uk.title,
    en: input.translations.en.title,
  });

  if (input.status === "published") {
    await assertPageCanPublish(id, input);
  }

  const label = entityDisplayName(input.translations, "Page");

  await recordEntityCreate(
    "page",
    id,
    `Created page "${label}"`,
    pageFormToHistorySnapshot(input),
    context,
  );

  return { id };
}

export async function updatePage(
  id: string,
  input: PageFormInput,
  context: HistoryMutationContext,
): Promise<PageMutationResult> {
  const existing = await findPageById(id);

  if (!existing) {
    throw new Error("Page not found");
  }

  const slugError = await validateUniqueSlugs(input, id);

  if (slugError) {
    throw new Error(slugError);
  }

  if (input.status === "published") {
    await assertPageCanPublish(id, input);
  }

  const before = pageDetailToHistorySnapshot(existing);
  const after = pageFormToHistorySnapshot(input);

  await updatePageRecord(id, input);

  const label = entityDisplayName(input.translations, "Page");

  await recordEntityUpdate("page", id, `Updated page "${label}"`, before, after, context);

  return { id };
}

export async function changePageStatus(
  id: string,
  status: PageStatus,
  context: HistoryMutationContext,
): Promise<void> {
  const existing = await findPageById(id);

  if (!existing) {
    throw new Error("Page not found");
  }

  if (status === "published") {
    await assertPageStatusCanPublish(id, pageFormInputFromDetail(existing));
  }

  await updatePageStatus(id, status);

  const label = entityDisplayName(existing.translations, "Page");
  const summary =
    status === "published"
      ? `Published page "${label}"`
      : existing.status === "published"
        ? `Unpublished page "${label}"`
        : `Changed page "${label}" status to ${status}`;

  await recordEntityStatusChange(
    "page",
    id,
    summary,
    existing.status,
    status,
    context,
  );
}

export async function deletePage(id: string, context: HistoryMutationContext): Promise<void> {
  const existing = await findPageById(id);

  if (!existing) {
    throw new Error("Page not found");
  }

  const deleted = await softDeletePage(id);

  if (!deleted) {
    throw new Error("Page not found");
  }

  const label = entityDisplayName(existing.translations, "Page");

  await recordEntityDelete(
    "page",
    id,
    `Deleted page "${label}"`,
    pageDetailToHistorySnapshot(existing),
    context,
  );
}
