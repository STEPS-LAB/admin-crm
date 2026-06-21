import { z } from "zod";

import { RESTORE_SCOPES } from "@/constants/backup";

export const restoreScopesSchema = z
  .array(z.enum(RESTORE_SCOPES))
  .min(1, "Select at least one restore scope");

export const backupIdSchema = z.object({
  backupId: z.string().uuid(),
});

export const protectBackupSchema = z.object({
  backupId: z.string().uuid(),
  isProtected: z.coerce.boolean(),
});
