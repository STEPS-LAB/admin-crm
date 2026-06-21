import { z } from "zod";

import { CATALOG_TRASH_ENTITY_TYPES } from "@/constants/catalog";

export const catalogTrashEntityTypeSchema = z.enum(CATALOG_TRASH_ENTITY_TYPES);

export const restoreCatalogEntitySchema = z.object({
  entityType: catalogTrashEntityTypeSchema,
  id: z.string().uuid(),
});

export type RestoreCatalogEntityInput = z.infer<typeof restoreCatalogEntitySchema>;
