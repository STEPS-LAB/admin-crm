import { Badge } from "@/components/ui/badge";
import { PRODUCT_STATUS_LABELS, type ProductStatus } from "@/constants/products";
import { cn } from "@/lib/utils/cn";

const STATUS_VARIANTS: Record<ProductStatus, "secondary" | "success" | "warning" | "outline"> = {
  draft: "secondary",
  published: "success",
  archived: "warning",
  hidden: "outline",
};

export interface ProductStatusBadgeProps {
  readonly status: ProductStatus;
  readonly className?: string;
}

export function ProductStatusBadge({ status, className }: ProductStatusBadgeProps): React.JSX.Element {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className={cn("capitalize", className)}>
      {PRODUCT_STATUS_LABELS[status]}
    </Badge>
  );
}
