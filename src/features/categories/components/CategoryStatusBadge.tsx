import { Badge } from "@/components/ui/badge";
import { CATEGORY_STATUS_LABELS, type CategoryStatus } from "@/constants/categories";
import { cn } from "@/lib/utils/cn";

const STATUS_VARIANTS: Record<CategoryStatus, "secondary" | "success" | "warning" | "outline"> = {
  draft: "secondary",
  published: "success",
  archived: "warning",
  hidden: "outline",
};

export interface CategoryStatusBadgeProps {
  readonly status: CategoryStatus;
  readonly className?: string;
}

export function CategoryStatusBadge({
  status,
  className,
}: CategoryStatusBadgeProps): React.JSX.Element {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className={cn("capitalize", className)}>
      {CATEGORY_STATUS_LABELS[status]}
    </Badge>
  );
}
