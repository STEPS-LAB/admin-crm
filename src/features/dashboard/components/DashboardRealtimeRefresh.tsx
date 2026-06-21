"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DASHBOARD_REFRESH_MS = 60_000;

export function DashboardRealtimeRefresh(): React.JSX.Element | null {
  const router = useRouter();

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      router.refresh();
    }, DASHBOARD_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [router]);

  return null;
}
