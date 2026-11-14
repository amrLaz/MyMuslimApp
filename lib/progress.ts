// Progression de l'enfant, gardée uniquement dans le navigateur (aucun compte,
// aucune donnée envoyée au serveur).
const KEY = "lissan.lettres";

export function readProgress(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function markDone(id: string): void {
  try {
    const done = readProgress();
    if (!done.includes(id)) {
      window.localStorage.setItem(KEY, JSON.stringify([...done, id]));
    }
  } catch {
    // Stockage indisponible (navigation privée) : la leçon marche quand même.
  }
}
