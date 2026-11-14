import { stripMarks } from "./ecriture";
import { ALL_WORDS, type Mot } from "./mots";
import type { LevelProgress } from "./store";

export type Level = {
  id: string;
  n: number;
  title: string;
  goal: string;
  /** « copy » : le mot arabe est montré et l'enfant le recopie ; « write » : il part du français. */
  mode: "copy" | "write";
  /** L'enfant doit aussi taper le chakl. */
  chakl: boolean;
  /** Quand l'enfant peut écouter le mot : toujours, ou seulement après une erreur. */
  audio: "always" | "afterMistake";
  words: Mot[];
};

/** Nombre de mots réussis (en deux essais au plus) pour passer au niveau suivant. */
export const PASS_MARK = 6;

const words = (skeletons: string[]): Mot[] =>
  skeletons.map((sk) => {
    const found = ALL_WORDS.find((w) => stripMarks(w.ar) === sk);
    if (!found) throw new Error(`Mot inconnu : ${sk}`);
    return found;
  });

export const LEVELS: Level[] = [
  {
    id: "1",
    n: 1,
    title: "Recopier",
    goal: "Recopie de petits mots : tu apprends à reconnaître les lettres.",
    mode: "copy",
    chakl: false,
    audio: "always",
    words: words(["أب", "أم", "يد", "جد", "بيت", "باب", "ماء", "شمس"]),
  },
  {
    id: "2",
    n: 2,
    title: "Écrire de petits mots",
    goal: "Un mot en français : écris-le en arabe, sans modèle.",
    mode: "write",
    chakl: false,
    audio: "always",
    words: words(["قلم", "خبز", "تمر", "سمك", "كلب", "جمل", "قمر", "بحر"]),
  },
  {
    id: "3",
    n: 3,
    title: "Écrire des mots plus longs",
    goal: "Quatre ou cinq lettres. Tu n'as l'audio qu'après une erreur.",
    mode: "write",
    chakl: false,
    audio: "afterMistake",
    words: words(["كتاب", "حليب", "تفاح", "نجمة", "وردة", "شجرة", "مدرسة", "سيارة"]),
  },
  {
    id: "4",
    n: 4,
    title: "Recopier avec le chakl",
    goal: "Recopie les mots avec leurs voyelles : fatha, damma, kasra…",
    mode: "copy",
    chakl: true,
    audio: "always",
    words: words(["أخت", "جدة", "ولد", "بنت", "قط", "ليل", "عين", "طير"]),
  },
  {
    id: "5",
    n: 5,
    title: "Écrire avec le chakl",
    goal: "Écris le mot en entier, voyelles comprises, sans modèle.",
    mode: "write",
    chakl: true,
    audio: "always",
    words: words(["أخ", "أسد", "فيل", "شاي", "لحم", "حصان", "رأس", "سيارة"]),
  },
  {
    id: "6",
    n: 6,
    title: "Les couleurs",
    goal: "Huit couleurs à écrire sans modèle. L'audio n'arrive qu'après une erreur.",
    mode: "write",
    chakl: false,
    audio: "afterMistake",
    words: words(["أحمر", "أزرق", "أخضر", "أصفر", "أبيض", "أسود", "وردي", "بني"]),
  },
  {
    id: "7",
    n: 7,
    title: "Les nombres avec le chakl",
    goal: "De un à huit, voyelles et chadda comprises. Le niveau le plus difficile.",
    mode: "write",
    chakl: true,
    audio: "afterMistake",
    words: words(["واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية"]),
  },
];

export const getLevel = (id: string) => LEVELS.find((l) => l.id === id);

export function isUnlocked(level: Level, progress: LevelProgress): boolean {
  if (level.n === 1) return true;
  const previous = LEVELS[level.n - 2];
  return Boolean(progress[previous.id]?.passed);
}

/** 0 si le niveau n'est pas réussi, puis 1 à 3 étoiles selon les mots écrits du premier coup. */
export function starsFor(succeeded: number, firstTry: number): number {
  if (succeeded < PASS_MARK) return 0;
  return firstTry >= 7 ? 3 : firstTry >= 5 ? 2 : 1;
}
