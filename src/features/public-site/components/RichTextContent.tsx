import { sanitizeRichText } from "@/lib/security/sanitizeRichText";
import { cn } from "@/lib/utils/cn";

export interface RichTextContentProps {
  readonly html: string | null;
  readonly className?: string;
}

function sanitizePublicRichText(html: string): string | null {
  try {
    const sanitized = sanitizeRichText(html).trim();
    return sanitized.length > 0 ? sanitized : null;
  } catch {
    return null;
  }
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
    return (
      <p className={cn("text-muted-foreground", className)}>
        {html.replace(/<[^>]+>/g, " ").trim()}
      </p>
    );
  }

  return (
    <div
      className={cn("public-rich-text text-muted-foreground space-y-4", className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
