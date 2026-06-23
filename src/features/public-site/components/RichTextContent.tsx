import { sanitizePublicRichText } from "@/lib/security/sanitizePublicRichText";
import { cn } from "@/lib/utils/cn";

export interface RichTextContentProps {
  readonly html: string | null;
  readonly className?: string;
}

export function RichTextContent({
  html,
  className,
}: RichTextContentProps): React.JSX.Element | null {
  if (!html) {
    return null;
  }

  const sanitized = sanitizePublicRichText(html);

  if (!sanitized) {
    return null;
  }

  return (
    <div
      className={cn("public-rich-text text-muted-foreground space-y-4", className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
