export interface RedirectHop {
  readonly id: string;
  readonly destination: string;
  readonly enabled: boolean;
}

export async function wouldCreateRedirectLoop(
  source: string,
  destination: string,
  resolveNext: (path: string) => Promise<RedirectHop | null>,
  excludeId?: string,
): Promise<boolean> {
  const visited = new Set<string>([source]);
  let current = destination;

  for (let depth = 0; depth < 10; depth += 1) {
    if (!current.startsWith("/")) {
      return false;
    }

    if (visited.has(current)) {
      return true;
    }

    if (current === source) {
      return true;
    }

    const next = await resolveNext(current);

    if (!next || !next.enabled || next.id === excludeId) {
      return false;
    }

    visited.add(current);
    current = next.destination;
  }

  return true;
}
