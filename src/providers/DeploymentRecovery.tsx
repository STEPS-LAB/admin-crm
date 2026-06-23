"use client";

import { useEffect } from "react";

import {
  clearDeploymentReloadGuard,
  registerDeploymentRecovery,
} from "@/lib/client/deploymentRecovery";

export function DeploymentRecovery(): null {
  useEffect(() => {
    clearDeploymentReloadGuard();
    return registerDeploymentRecovery();
  }, []);

  return null;
}
