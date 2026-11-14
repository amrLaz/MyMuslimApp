// Tout ce que l'app sait de l'enfant reste dans le navigateur de la famille :
// pas de compte, rien n'est enregistré sur nos serveurs.
import { useEffect, useState } from "react";
import type { CountryId } from "./countries";

export const GOALS = [
  { id: "parler", label: "Parler avec la famille" },
  { id: "lire", label: "Lire et écrire l'arabe" },
  { id: "coran", label: "Apprendre le Coran" },
] as const;
export type GoalId = (typeof GOALS)[number]["id"];

export type Profile = { name: string; age: number; derja: CountryId; goals: GoalId[] };
export type Word = { ar: string; translit: string; fr: string };
export type Activity = {
  at: string;
  kind: "lettre" | "conversation" | "sourate";
  id: string;
  label: string;
  words?: Word[];
  /** Nombre de corrections données par le tuteur pendant la conversation. */
  corrections?: number;
};

const KEYS = {
  profile: "lissan.profil",
  journal: "lissan.journal",
  letters: "lissan.lettres",
  surahs: "lissan.sourates",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Stockage indisponible (navigation privée) : l'app marche, sans mémoire.
  }
}

export const getProfile = () => read<Profile | null>(KEYS.profile, null);
export const saveProfile = (p: Profile) => write(KEYS.profile, p);

export const getJournal = () => read<Activity[]>(KEYS.journal, []);
export function logActivity(a: Omit<Activity, "at">): void {
  // Un an d'activité quotidienne tient largement dans cette limite.
  write(KEYS.journal, [...getJournal(), { ...a, at: new Date().toISOString() }].slice(-1000));
}

function addOnce(key: string, id: string): boolean {
  const list = read<string[]>(key, []);
  if (list.includes(id)) return false;
  write(key, [...list, id]);
  return true;
}

export const getLetters = () => read<string[]>(KEYS.letters, []);
export function markLetterDone(id: string, label: string): void {
  if (addOnce(KEYS.letters, id)) logActivity({ kind: "lettre", id, label });
}

export const getSurahs = () => read<number[]>(KEYS.surahs, []);
export function setSurahKnown(id: number, known: boolean): void {
  const rest = getSurahs().filter((s) => s !== id);
  write(KEYS.surahs, known ? [...rest, id] : rest);
}

export function eraseEverything(): void {
  try {
    for (const key of Object.values(KEYS)) window.localStorage.removeItem(key);
  } catch {
    // Rien à effacer si le stockage est indisponible.
  }
}

/**
 * Lit une valeur du navigateur après le premier rendu (le serveur ne la
 * connaît pas). `ready` passe à true une fois la lecture faite.
 */
export function useStored<T>(reader: () => T): { ready: boolean; value: T | undefined } {
  const [state, setState] = useState<{ ready: boolean; value: T | undefined }>({
    ready: false,
    value: undefined,
  });
  useEffect(() => {
    setState({ ready: true, value: reader() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return state;
}

/** Activités des 7 derniers jours. */
export function lastWeek(journal: Activity[], now = new Date()): Activity[] {
  const since = now.getTime() - 7 * 24 * 3600 * 1000;
  return journal.filter((a) => new Date(a.at).getTime() >= since);
}
