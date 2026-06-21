export interface IpAccessPolicy {
  readonly allowList: readonly string[];
  readonly blockList: readonly string[];
}

let cachedPolicy: IpAccessPolicy | null = null;
let cachedAt = 0;

export function getCachedIpAccessPolicy(maxAgeMs: number): IpAccessPolicy | null {
  if (!cachedPolicy) {
    return null;
  }

  if (Date.now() - cachedAt > maxAgeMs) {
    cachedPolicy = null;
    return null;
  }

  return cachedPolicy;
}

export function setCachedIpAccessPolicy(policy: IpAccessPolicy): void {
  cachedPolicy = policy;
  cachedAt = Date.now();
}

export function clearCachedIpAccessPolicy(): void {
  cachedPolicy = null;
  cachedAt = 0;
}
