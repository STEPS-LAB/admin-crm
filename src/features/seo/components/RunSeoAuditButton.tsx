"use client";

import { Loader2, ScanSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { runSeoCenterAuditAction } from "@/actions/seo";
import { Button } from "@/components/ui/button";

export function RunSeoAuditButton(): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const runAudit = (): void => {
    startTransition(async () => {
      const result = await runSeoCenterAuditAction();

      if (result.success) {
        toast.success(
          `SEO audit completed for ${result.data.scannedProfiles} profiles (score ${result.data.overview.globalScore})`,
        );
        router.refresh();
        return;
      }

      toast.error(result.error);
    });
  };

  return (
    <Button type="button" variant="outline" onClick={runAudit} disabled={isPending}>
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <ScanSearch className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="ml-2">Run audit</span>
    </Button>
  );
}
