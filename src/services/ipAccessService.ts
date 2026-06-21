import { IP_POLICY_CACHE_SECONDS } from "@/constants/auth";
import { findIpAccessPolicy } from "@/repositories/settingsRepository";
import {
  clearCachedIpAccessPolicy,
  getCachedIpAccessPolicy,
  setCachedIpAccessPolicy,
  type IpAccessPolicy,
} from "@/lib/security/ipAccessCache";

export async function getIpAccessPolicy(): Promise<IpAccessPolicy> {
  const cached = getCachedIpAccessPolicy(IP_POLICY_CACHE_SECONDS * 1000);

  if (cached) {
    return cached;
  }

  const policy = await findIpAccessPolicy();
  setCachedIpAccessPolicy(policy);

  return policy;
}

export function invalidateIpAccessPolicyCache(): void {
  clearCachedIpAccessPolicy();
}
