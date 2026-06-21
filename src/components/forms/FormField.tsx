import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export interface FormFieldProps {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly error?: string | undefined;
  readonly required?: boolean;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function FormField({
  id,
  label,
  description,
  error,
  required = false,
  children,
  className,
}: FormFieldProps): React.JSX.Element {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {children}
      {description ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
