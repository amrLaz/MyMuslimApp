// Garde-fou contre l'abus des clés API : un quota par adresse et par tranche de
// 10 minutes. En mémoire, donc par instance de serveur.
const WINDOW_MS = 10 * 60 * 1000;

export function createLimiter(max: number) {
  const hits = new Map<string, number[]>();
  return (ip: string): boolean => {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= max) {
      hits.set(ip, recent);
      return false;
    }
    hits.set(ip, [...recent, now]);
    if (hits.size > 5000) hits.clear();
    return true;
  };
}

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}
