import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface SettingsFormFooterProps {
  readonly isPending: boolean;
  readonly label?: string;
}

export function SettingsFormFooter({
  isPending,
  label = "Save changes",
}: SettingsFormFooterProps): React.JSX.Element {
  return (
    <div className="sticky bottom-0 z-10 -mx-1 border-t border-border/60 bg-background/95 px-1 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {label}
        </Button>
      </div>
    </div>
  );
}
