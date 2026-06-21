import { sanitizeRichTextInput } from "@/lib/security/sanitizeRichText";

import type { BrandFormValues } from "@/schemas/brands/brandSchemas";
import type { PageFormValues } from "@/schemas/pages/pageSchemas";

export function sanitizePageFormRichText(input: PageFormValues): PageFormValues {
  return {
    ...input,
    translations: {
      uk: {
        ...input.translations.uk,
        content: sanitizeRichTextInput(input.translations.uk.content),
      },
      en: {
        ...input.translations.en,
        content: sanitizeRichTextInput(input.translations.en.content),
      },
    },
  };
}

export function sanitizeBrandFormRichText(input: BrandFormValues): BrandFormValues {
  return {
    ...input,
    translations: {
      uk: {
        ...input.translations.uk,
        description: sanitizeRichTextInput(input.translations.uk.description),
      },
      en: {
        ...input.translations.en,
        description: sanitizeRichTextInput(input.translations.en.description),
      },
    },
  };
}
