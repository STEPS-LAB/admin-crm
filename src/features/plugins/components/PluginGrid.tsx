import { EmptyState } from "@/components/feedback/EmptyState";
import { PluginCard } from "@/features/plugins/components/PluginCard";

import type { PluginListItem } from "@/types/plugins";

export interface PluginGridProps {
  readonly items: readonly PluginListItem[];
}

export function PluginGrid({ items }: PluginGridProps): React.JSX.Element {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No plugins match your filters"
        description="Try a different type, status, or search term."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((plugin) => (
        <PluginCard key={plugin.slug} plugin={plugin} />
      ))}
    </div>
  );
}
