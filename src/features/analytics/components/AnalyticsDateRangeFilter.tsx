"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ANALYTICS_DATE_RANGE_LABELS,
  ANALYTICS_DATE_RANGE_OPTIONS,
  type AnalyticsDateRange,
} from "@/constants/analytics";

export function AnalyticsDateRangeFilter(): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentValue = searchParams.get("days") ?? "30";

  const updateRange = (value: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", value);

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <Select value={currentValue} onValueChange={updateRange} disabled={isPending}>
      <SelectTrigger className="w-[180px]" aria-label="Analytics date range">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ANALYTICS_DATE_RANGE_OPTIONS.map((days) => (
          <SelectItem key={days} value={String(days)}>
            {ANALYTICS_DATE_RANGE_LABELS[days as AnalyticsDateRange]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
