import {
  redirectDetailToHistorySnapshot,
  redirectFormToHistorySnapshot,
} from "@/lib/history/snapshots";
import {
  deleteRedirectRecord,
  findRedirectById,
  findRedirectBySource,
  findRedirects,
  insertRedirect,
  sourceExists,
  updateRedirectRecord,
} from "@/repositories/redirectRepository";
import { wouldCreateRedirectLoop } from "@/lib/seo/redirectLoop";
import {
  recordEntityCreate,
  recordEntityDelete,
  recordEntityUpdate,
  type HistoryMutationContext,
} from "@/services/historyService";

import type { Pagination } from "@/types";
import type {
  RedirectDetail,
  RedirectFormInput,
  RedirectListFilters,
  RedirectListItem,
} from "@/types/seo-center";

export interface RedirectMutationResult {
  readonly id: string;
}

async function detectRedirectLoop(source: string, destination: string, excludeId?: string): Promise<boolean> {
  return wouldCreateRedirectLoop(source, destination, async (path) => {
    const redirect = await findRedirectBySource(path);

    if (!redirect) {
      return null;
    }

    return {
      id: redirect.id,
      destination: redirect.destination,
      enabled: redirect.enabled,
    };
  }, excludeId);
}

export async function listRedirects(
  filters: RedirectListFilters,
): Promise<Pagination<RedirectListItem>> {
  return findRedirects(filters);
}

export async function getRedirect(id: string): Promise<RedirectDetail | null> {
  return findRedirectById(id);
}

export async function createRedirect(
  input: RedirectFormInput,
  context: HistoryMutationContext,
): Promise<RedirectMutationResult> {
  if (input.source === input.destination) {
    throw new Error("Source and destination cannot be the same");
  }

  if (await sourceExists(input.source)) {
    throw new Error("A redirect with this source path already exists");
  }

  if (await detectRedirectLoop(input.source, input.destination)) {
    throw new Error("This redirect would create a loop");
  }

  const id = await insertRedirect(input);

  await recordEntityCreate(
    "redirect",
    id,
    `Created redirect ${input.source} → ${input.destination}`,
    redirectFormToHistorySnapshot(input),
    context,
  );

  return { id };
}

export async function updateRedirect(
  id: string,
  input: RedirectFormInput,
  context: HistoryMutationContext,
): Promise<RedirectMutationResult> {
  const existing = await findRedirectById(id);

  if (!existing) {
    throw new Error("Redirect not found");
  }

  if (input.source === input.destination) {
    throw new Error("Source and destination cannot be the same");
  }

  if (await sourceExists(input.source, id)) {
    throw new Error("A redirect with this source path already exists");
  }

  if (await detectRedirectLoop(input.source, input.destination, id)) {
    throw new Error("This redirect would create a loop");
  }

  const before = redirectDetailToHistorySnapshot(existing);
  const after = redirectFormToHistorySnapshot(input);

  await updateRedirectRecord(id, input);

  await recordEntityUpdate(
    "redirect",
    id,
    `Updated redirect ${input.source} → ${input.destination}`,
    before,
    after,
    context,
  );

  return { id };
}

export async function deleteRedirect(id: string, context: HistoryMutationContext): Promise<void> {
  const existing = await findRedirectById(id);

  if (!existing) {
    throw new Error("Redirect not found");
  }

  const deleted = await deleteRedirectRecord(id);

  if (!deleted) {
    throw new Error("Redirect not found");
  }

  await recordEntityDelete(
    "redirect",
    id,
    `Deleted redirect ${existing.source} → ${existing.destination}`,
    redirectDetailToHistorySnapshot(existing),
    context,
  );
}
