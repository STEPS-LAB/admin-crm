export interface RequestMetadata {
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly browser: string | null;
  readonly operatingSystem: string | null;
  readonly deviceName: string | null;
}

export function extractRequestMetadata(
  headers: Headers,
): RequestMetadata {
  const userAgent = headers.get("user-agent");
  const forwarded = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const ipAddress = forwarded?.split(",")[0]?.trim() ?? realIp ?? null;

  return {
    ipAddress,
    userAgent,
    browser: parseBrowser(userAgent),
    operatingSystem: parseOperatingSystem(userAgent),
    deviceName: parseDeviceName(userAgent),
  };
}

function parseBrowser(userAgent: string | null): string | null {
  if (!userAgent) {
    return null;
  }

  if (userAgent.includes("Firefox/")) {
    return "Firefox";
  }

  if (userAgent.includes("Edg/")) {
    return "Edge";
  }

  if (userAgent.includes("Chrome/")) {
    return "Chrome";
  }

  if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    return "Safari";
  }

  return "Unknown";
}

function parseOperatingSystem(userAgent: string | null): string | null {
  if (!userAgent) {
    return null;
  }

  if (userAgent.includes("Windows")) {
    return "Windows";
  }

  if (userAgent.includes("Mac OS X")) {
    return "macOS";
  }

  if (userAgent.includes("Linux")) {
    return "Linux";
  }

  if (userAgent.includes("Android")) {
    return "Android";
  }

  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    return "iOS";
  }

  return "Unknown";
}

function parseDeviceName(userAgent: string | null): string | null {
  if (!userAgent) {
    return null;
  }

  if (userAgent.includes("Mobile")) {
    return "Mobile";
  }

  if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
    return "Tablet";
  }

  return "Desktop";
}
