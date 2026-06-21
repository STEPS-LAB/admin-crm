import { Badge } from "@/components/ui/badge";
import { PAGE_STATUS_LABELS, type PageStatus } from "@/constants/pages";
import { cn } from "@/lib/utils/cn";

const STATUS_VARIANTS: Record<PageStatus, "secondary" | "success" | "warning" | "outline"> = {
  draft: "secondary",
  published: "success",
  archived: "warning",
  hidden: "outline",
};

export interface PageStatusBadgeProps {
  readonly status: PageStatus;
  readonly className?: string;
}

export function PageStatusBadge({ status, className }: PageStatusBadgeProps): React.JSX.Element {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className={cn("capitalize", className)}>
      {PAGE_STATUS_LABELS[status]}
    </Badge>
  );
}
