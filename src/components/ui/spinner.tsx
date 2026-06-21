import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface SpinnerProps {
  readonly className?: string;
  readonly label?: string;
}

export function Spinner({ className, label = "Loading" }: SpinnerProps): React.JSX.Element {
  return (
    <Loader2
      className={cn("h-5 w-5 animate-spin text-muted-foreground", className)}
      aria-label={label}
      role="status"
    />
  );
}
