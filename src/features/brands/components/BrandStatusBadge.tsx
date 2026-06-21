import { Badge } from "@/components/ui/badge";
import { BRAND_STATUS_LABELS, type BrandStatus } from "@/constants/brands";
import { cn } from "@/lib/utils/cn";

const STATUS_VARIANTS: Record<BrandStatus, "secondary" | "success" | "warning" | "outline"> = {
  draft: "secondary",
  published: "success",
  archived: "warning",
  hidden: "outline",
};

export interface BrandStatusBadgeProps {
  readonly status: BrandStatus;
  readonly className?: string;
}

export function BrandStatusBadge({ status, className }: BrandStatusBadgeProps): React.JSX.Element {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className={cn("capitalize", className)}>
      {BRAND_STATUS_LABELS[status]}
    </Badge>
  );
}
