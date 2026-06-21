import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export interface KpiCardProps {
  readonly title: string;
  readonly value: number | string;
  readonly description?: string;
  readonly icon: LucideIcon;
  readonly href?: string;
  readonly secondary?: string;
  readonly className?: string;
}

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  secondary,
  className,
}: KpiCardProps): React.JSX.Element {
  const content = (
    <Card
      className={cn(
        "transition-shadow duration-200",
        href && "hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
          <Icon className="h-[18px] w-[18px] text-muted-foreground" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {secondary ? <p className="mt-1 text-xs text-muted-foreground">{secondary}</p> : null}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {content}
      </Link>
    );
  }

  return content;
}
