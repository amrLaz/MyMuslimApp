// Révision espacée (boîtes de Leitner) : ce qui est su revient de plus en plus
// tard, ce qui est raté revient dès le lendemain. C'est ce qui fait passer une
// lettre ou un mot de la mémoire du jour à la mémoire longue.

export type Card = { box: number; due: string };
export type Deck = Record<string, Card>;

/** Jours d'attente avant la prochaine révision, selon la boîte (1 à 5). */
const INTERVALS = [0, 1, 3, 7, 14, 30];
export const MAX_BOX = 5;
/** À partir de cette boîte, l'élément est considéré comme acquis. */
export const MASTERED_BOX = 4;

/** La date du jour à l'heure locale, sous la forme AAAA-MM-JJ. */
export function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export const letterKey = (id: string) => `l:${id}`;
export const wordKey = (skeleton: string) => `m:${skeleton}`;

/** Ajoute un élément à réviser. `today` : à revoir le jour même (il vient d'être raté). */
export function enroll(deck: Deck, key: string, now: Date, today = false): Deck {
  if (deck[key]) return deck;
  return { ...deck, [key]: { box: 1, due: dayKey(today ? now : addDays(now, 1)) } };
}

export function grade(deck: Deck, key: string, ok: boolean, now: Date): Deck {
  const card = deck[key];
  if (!card) return deck;
  const box = ok ? Math.min(MAX_BOX, card.box + 1) : 1;
  return { ...deck, [key]: { box, due: dayKey(addDays(now, ok ? INTERVALS[box] : 1)) } };
}

/** Les éléments à réviser aujourd'hui, les plus en retard d'abord. */
export function dueKeys(deck: Deck, now: Date): string[] {
  const today = dayKey(now);
  return Object.keys(deck)
    .filter((k) => deck[k].due <= today)
    .sort((a, b) => deck[a].due.localeCompare(deck[b].due) || deck[a].box - deck[b].box);
}

export function deckStats(deck: Deck): { total: number; mastered: number } {
  const cards = Object.values(deck);
  return { total: cards.length, mastered: cards.filter((c) => c.box >= MASTERED_BOX).length };
}

/** Nombre de jours d'affilée avec de l'activité, en comptant aujourd'hui ou hier. */
export function streak(days: string[], now: Date): number {
  const set = new Set(days);
  let cursor = set.has(dayKey(now)) ? now : addDays(now, -1);
  let n = 0;
  while (set.has(dayKey(cursor))) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}
