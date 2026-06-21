import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils/cn";

export interface LoadingStateProps {
  readonly label?: string;
  readonly className?: string;
  readonly fullPage?: boolean;
}

export function LoadingState({
  label = "Loading…",
  className,
  fullPage = false,
}: LoadingStateProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground",
        fullPage && "min-h-[50vh]",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner label={label} />
      <span>{label}</span>
    </div>
  );
}
