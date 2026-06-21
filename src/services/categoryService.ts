import {
  categoryDetailToHistorySnapshot,
  categoryFormToHistorySnapshot,
  entityDisplayName,
} from "@/lib/history/snapshots";
import {
  findAllCategoryIds,
  findCategoriesFlat,
  findCategoryById,
  insertCategory,
  slugExists,
  softDeleteCategory,
  updateCategoryRecord,
  updateCategorySortOrders,
  updateCategoryStatus,
} from "@/repositories/categoryRepository";
import {
  assertCategoryCanPublish,
  assertCategoryStatusCanPublish,
  provisionCategorySeoProfiles,
} from "@/services/publishValidationService";
import {
  recordEntityCreate,
  recordEntityDelete,
  recordEntityStatusChange,
  recordEntityUpdate,
  recordHistoryEntry,
  type HistoryMutationContext,
} from "@/services/historyService";
import { emitWebhookEvent } from "@/services/webhookService";

import type {
  CategoryDetail,
  CategoryFlatItem,
  CategoryFormInput,
  CategoryListFilters,
  CategoryParentOption,
  CategoryTreeNode,
} from "@/types/categories";
import type { CategoryStatus } from "@/constants/categories";

export interface CategoryMutationResult {
  readonly id: string;
}

function buildDescendantMap(
  nodes: Array<{ id: string; parentId: string | null }>,
): Map<string, string[]> {
  const childrenByParent = new Map<string | null, string[]>();

  for (const node of nodes) {
    const siblings = childrenByParent.get(node.parentId) ?? [];
    siblings.push(node.id);
    childrenByParent.set(node.parentId, siblings);
  }

  const descendants = new Map<string, string[]>();

  const collectDescendants = (id: string): string[] => {
    const cached = descendants.get(id);

    if (cached) {
      return cached;
    }

    const children = childrenByParent.get(id) ?? [];
    const all = [...children];

    for (const childId of children) {
      all.push(...collectDescendants(childId));
    }

    descendants.set(id, all);
    return all;
  };

  for (const node of nodes) {
    collectDescendants(node.id);
  }

  return descendants;
}

export function buildCategoryTree(items: CategoryFlatItem[]): CategoryTreeNode[] {
  const nodeMap = new Map<string, CategoryTreeNode>();

  for (const item of items) {
    nodeMap.set(item.id, { ...item, children: [] });
  }

  const roots: CategoryTreeNode[] = [];

  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: CategoryTreeNode[]): void => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    nodes.forEach((node) => sortNodes(node.children));
  };

  sortNodes(roots);

  return roots;
}

function filterTreeBySearch(nodes: CategoryTreeNode[], search: string): CategoryTreeNode[] {
  const normalized = search.toLowerCase();

  const filterNode = (node: CategoryTreeNode): CategoryTreeNode | null => {
    const children = node.children
      .map(filterNode)
      .filter((child): child is CategoryTreeNode => child !== null);

    const matches =
      node.name.toLowerCase().includes(normalized) ||
      node.slug.toLowerCase().includes(normalized) ||
      (node.description?.toLowerCase().includes(normalized) ?? false);

    if (matches || children.length > 0) {
      return { ...node, children };
    }

    return null;
  };

  return nodes.map(filterNode).filter((node): node is CategoryTreeNode => node !== null);
}

export async function listCategoryTree(filters: CategoryListFilters = {}): Promise<CategoryTreeNode[]> {
  const items = await findCategoriesFlat(filters);
  const tree = buildCategoryTree(items);

  if (filters.search) {
    return filterTreeBySearch(tree, filters.search);
  }

  return tree;
}

export async function getCategory(id: string): Promise<CategoryDetail | null> {
  return findCategoryById(id);
}

export async function getCategoryParentOptions(
  excludeCategoryId?: string,
): Promise<CategoryParentOption[]> {
  const [items, hierarchy] = await Promise.all([findCategoriesFlat(), findAllCategoryIds()]);

  const parentById = new Map(hierarchy.map((node) => [node.id, node.parentId]));
  const descendants = excludeCategoryId
    ? new Set(buildDescendantMap(hierarchy).get(excludeCategoryId) ?? [])
    : new Set<string>();

  const getDepth = (id: string): number => {
    const parentId = parentById.get(id);

    if (!parentId) {
      return 0;
    }

    return getDepth(parentId) + 1;
  };

  return items
    .filter((item) => item.id !== excludeCategoryId && !descendants.has(item.id))
    .map((item) => {
      const depth = getDepth(item.id);

      return {
        id: item.id,
        label: `${depth > 0 ? `${"— ".repeat(depth)}` : ""}${item.name}`,
        depth,
      };
    });
}

async function validateUniqueSlugs(
  input: CategoryFormInput,
  excludeCategoryId?: string,
): Promise<string | null> {
  for (const language of ["uk", "en"] as const) {
    const slug = input.translations[language].slug;

    if (await slugExists(language, slug, excludeCategoryId)) {
      return `Slug "${slug}" already exists for ${language.toUpperCase()}`;
    }
  }

  return null;
}

async function validateParent(
  categoryId: string | undefined,
  parentId: string | null,
): Promise<string | null> {
  if (!parentId) {
    return null;
  }

  if (categoryId && parentId === categoryId) {
    return "Category cannot be its own parent";
  }

  if (!categoryId) {
    return null;
  }

  const hierarchy = await findAllCategoryIds();
  const descendants = buildDescendantMap(hierarchy).get(categoryId) ?? [];

  if (descendants.includes(parentId)) {
    return "Cannot move category into its own descendant";
  }

  return null;
}

export async function createCategory(
  input: CategoryFormInput,
  context: HistoryMutationContext,
): Promise<CategoryMutationResult> {
  const parentError = await validateParent(undefined, input.parentId);

  if (parentError) {
    throw new Error(parentError);
  }

  const slugError = await validateUniqueSlugs(input);

  if (slugError) {
    throw new Error(slugError);
  }

  const id = await insertCategory(input);

  await provisionCategorySeoProfiles(id, {
    uk: input.translations.uk.name,
    en: input.translations.en.name,
  });

  if (input.status === "published") {
    await assertCategoryCanPublish(id, input);
  }

  const label = entityDisplayName(input.translations, "Category");

  await recordEntityCreate(
    "category",
    id,
    `Created category "${label}"`,
    categoryFormToHistorySnapshot(input),
    context,
  );

  return { id };
}

export async function updateCategory(
  id: string,
  input: CategoryFormInput,
  context: HistoryMutationContext,
): Promise<CategoryMutationResult> {
  const existing = await findCategoryById(id);

  if (!existing) {
    throw new Error("Category not found");
  }

  const parentError = await validateParent(id, input.parentId);

  if (parentError) {
    throw new Error(parentError);
  }

  const slugError = await validateUniqueSlugs(input, id);

  if (slugError) {
    throw new Error(slugError);
  }

  if (input.status === "published") {
    await assertCategoryCanPublish(id, input);
  }

  const before = categoryDetailToHistorySnapshot(existing);
  const after = categoryFormToHistorySnapshot(input);

  await updateCategoryRecord(id, input);

  const label = entityDisplayName(input.translations, "Category");

  await recordEntityUpdate(
    "category",
    id,
    `Updated category "${label}"`,
    before,
    after,
    context,
  );

  emitWebhookEvent("category.updated", {
    id,
    status: input.status,
  });

  return { id };
}

export async function changeCategoryStatus(
  id: string,
  status: CategoryStatus,
  context: HistoryMutationContext,
): Promise<void> {
  const existing = await findCategoryById(id);

  if (!existing) {
    throw new Error("Category not found");
  }

  if (status === "published") {
    await assertCategoryStatusCanPublish(id, {
      parentId: existing.parentId,
      sortOrder: existing.sortOrder,
      status: existing.status,
      translations: existing.translations,
    });
  }

  await updateCategoryStatus(id, status);

  const label = entityDisplayName(existing.translations, "Category");
  const summary =
    status === "published"
      ? `Published category "${label}"`
      : existing.status === "published"
        ? `Unpublished category "${label}"`
        : `Changed category "${label}" status to ${status}`;

  await recordEntityStatusChange(
    "category",
    id,
    summary,
    existing.status,
    status,
    context,
  );
}

export async function deleteCategory(id: string, context: HistoryMutationContext): Promise<void> {
  const existing = await findCategoryById(id);

  if (!existing) {
    throw new Error("Category not found");
  }

  if (existing.productCount > 0) {
    throw new Error("Cannot delete a category that contains products");
  }

  if (existing.childrenCount > 0) {
    throw new Error("Cannot delete a category that has child categories");
  }

  const deleted = await softDeleteCategory(id);

  if (!deleted) {
    throw new Error("Category not found");
  }

  const label = entityDisplayName(existing.translations, "Category");

  await recordEntityDelete(
    "category",
    id,
    `Deleted category "${label}"`,
    categoryDetailToHistorySnapshot(existing),
    context,
  );
}

export async function reorderCategorySiblings(
  parentId: string | null,
  orderedIds: string[],
  context: HistoryMutationContext,
): Promise<void> {
  const items = await findCategoriesFlat();
  const siblings = items.filter((item) => item.parentId === parentId);
  const siblingIds = new Set(siblings.map((item) => item.id));

  if (orderedIds.length !== siblings.length) {
    throw new Error("Invalid category reorder request");
  }

  for (const id of orderedIds) {
    if (!siblingIds.has(id)) {
      throw new Error("Category does not belong to the selected parent");
    }
  }

  await updateCategorySortOrders(parentId, orderedIds);

  await recordHistoryEntry({
    entityType: "category",
    entityId: orderedIds[0]!,
    operation: "update",
    changeSummary: `Reordered ${orderedIds.length} categor${orderedIds.length === 1 ? "y" : "ies"}`,
    context,
    afterData: {
      parentId,
      orderedIds,
    },
  });
}
