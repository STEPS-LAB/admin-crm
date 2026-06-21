import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/navigation/PageHeader";

export interface ModulePlaceholderProps {
  readonly title: string;
  readonly description: string;
  readonly breadcrumbs: Array<{ label: string; href?: string }>;
  readonly icon: LucideIcon;
}

export function ModulePlaceholder({
  title,
  description,
  breadcrumbs,
  icon,
}: ModulePlaceholderProps): React.JSX.Element {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} />
      <div className="mt-8">
        <EmptyState icon={icon} title={`${title} module`} description="This module will be implemented in an upcoming phase." />
      </div>
    </div>
  );
}
