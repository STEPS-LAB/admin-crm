import type { CatalogTrashEntityType } from "@/constants/catalog";

export interface CatalogTrashListItem {
  readonly id: string;
  readonly entityType: CatalogTrashEntityType;
  readonly label: string;
  readonly secondaryLabel: string | null;
  readonly deletedAt: Date;
}
