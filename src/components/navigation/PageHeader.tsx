import { cn } from "@/lib/utils/cn";

import { AppBreadcrumbs, type BreadcrumbItemConfig } from "./AppBreadcrumbs";

export interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly breadcrumbs?: BreadcrumbItemConfig[];
  readonly actions?: React.ReactNode;
  readonly className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps): React.JSX.Element {
  return (
    <div className={cn("space-y-4 border-b border-border/60 pb-6", className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? <AppBreadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
