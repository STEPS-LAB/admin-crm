import { sanitizeRichText } from "@/lib/security/sanitizeRichText";
import { cn } from "@/lib/utils/cn";

export interface RichTextContentProps {
  readonly html: string | null;
  readonly className?: string;
}

export function RichTextContent({ html, className }: RichTextContentProps): React.JSX.Element | null {
  if (!html) {
    return null;
  }

  const sanitized = sanitizeRichText(html);

  if (!sanitized) {
    return null;
  }

  return (
    <div
      className={cn("public-rich-text space-y-4 text-muted-foreground", className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
