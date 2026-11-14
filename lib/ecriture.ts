import { LETTERS } from "./alphabet";

const MARKS = /[ً-ٰٟـ]/g;

/** Le mot sans chakl ni espaces : ce que l'enfant doit écrire. */
export const stripMarks = (s: string) => s.replace(MARKS, "").replace(/\s+/g, "");

// Le alif avec ou sans hamza compte pour la même lettre à la comparaison.
const fold = (s: string) => s.replace(/[آأإٱ]/g, "ا");

const isArabicLetter = (c: string) => /[ء-يٱ]/.test(c);

const EXTRA_NAMES: Record<string, string> = {
  ة: "Ta marbouta",
  ء: "Hamza",
  أ: "Alif avec hamza",
  إ: "Alif avec hamza dessous",
  آ: "Alif madda",
  ى: "Alif maqsoura",
  ؤ: "Waw avec hamza",
  ئ: "Ya avec hamza",
};

export function letterName(c: string): string {
  return LETTERS.find((l) => l.glyph === c)?.name ?? EXTRA_NAMES[c] ?? c;
}

export type Op = { type: "match" | "sub" | "ins" | "del"; want?: string; got?: string };

/** Aligne la réponse sur le mot attendu (distance d'édition) pour dire où est chaque erreur. */
export function align(want: string[], got: string[]): Op[] {
  const n = want.length;
  const m = got.length;
  const d: number[][] = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (want[i - 1] === got[j - 1] ? 0 : 1),
      );
    }
  }
  const ops: Op[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && want[i - 1] === got[j - 1] && d[i][j] === d[i - 1][j - 1]) {
      ops.push({ type: "match", want: want[i - 1], got: got[j - 1] });
      i--;
      j--;
    } else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) {
      ops.push({ type: "sub", want: want[i - 1], got: got[j - 1] });
      i--;
      j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      ops.push({ type: "del", want: want[i - 1] });
      i--;
    } else {
      ops.push({ type: "ins", got: got[j - 1] });
      j--;
    }
  }
  return ops.reverse();
}

export type Check = {
  /** Toutes les lettres sont les bonnes. */
  ok: boolean;
  /** Bonne réponse, hamza comprise (sinon : le alif était écrit sans hamza). */
  exact: boolean;
  /** La réponse contient autre chose que des lettres arabes. */
  nonArabic: boolean;
  ops: Op[];
};

export function check(word: string, attempt: string): Check {
  const raw = stripMarks(attempt);
  if (raw.length === 0 || ![...raw].every(isArabicLetter)) {
    return { ok: false, exact: false, nonArabic: true, ops: [] };
  }
  const ops = align([...fold(stripMarks(word))], [...fold(raw)]);
  const ok = ops.every((o) => o.type === "match");
  return { ok, exact: ok && stripMarks(word) === raw, nonArabic: false, ops };
}

// Lettres qui ne diffèrent que par leurs points.
const LOOKALIKE = ["بتثني", "جحخ", "دذ", "رز", "سش", "صض", "طظ", "عغ", "فق", "هة"];

/**
 * Explique les erreurs en français. Tant que `reveal` est faux, on dit où
 * chercher sans donner la bonne lettre : l'enfant doit la retrouver.
 */
export function advice(ops: Op[], reveal: boolean): string[] {
  const out: string[] = [];
  for (const op of ops) {
    if (op.type === "sub") {
      const got = letterName(op.got!);
      const need = reveal ? ` Il fallait ${letterName(op.want!)}.` : "";
      const alike = LOOKALIKE.some((g) => g.includes(op.want!) && g.includes(op.got!));
      out.push(
        alike
          ? `${got} ressemble à la bonne lettre, mais regarde bien les points.${need}`
          : `${got} n'est pas la bonne lettre.${need}`,
      );
    } else if (op.type === "del") {
      out.push(reveal ? `Il manque la lettre ${letterName(op.want!)}.` : "Il manque une lettre.");
    } else if (op.type === "ins") {
      out.push(`La lettre ${letterName(op.got!)} est en trop.`);
    }
  }
  return out.slice(0, 3);
}
