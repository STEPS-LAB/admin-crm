import { z } from "zod";

import { normalizeRichTextValue } from "@/lib/security/richText";

export const richTextFieldSchema = z
  .union([z.string(), z.null()])
  .transform((value) => normalizeRichTextValue(value));
