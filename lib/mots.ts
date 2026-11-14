import { HARAKAT } from "./alphabet";

export type Mot = { fr: string; ar: string; translit: string };
export type Theme = { id: string; title: string; ar: string; description: string; words: Mot[] };

// Les mots sont écrits avec leur chakl complet, en arabe littéraire : c'est
// l'arabe qui s'écrit, à l'école comme dans le Coran. La derja se parle surtout.
// À faire relire par un enseignant d'arabe avant le lancement.
export const THEMES: Theme[] = [
  {
    id: "famille",
    title: "La famille",
    ar: "عائلة",
    description: "Père, mère, frères et sœurs, grands-parents.",
    words: [
      { fr: "Père", ar: "أَب", translit: "ab" },
      { fr: "Mère", ar: "أُمّ", translit: "oumm" },
      { fr: "Frère", ar: "أَخ", translit: "akh" },
      { fr: "Sœur", ar: "أُخْت", translit: "oukht" },
      { fr: "Grand-père", ar: "جَدّ", translit: "jadd" },
      { fr: "Grand-mère", ar: "جَدَّة", translit: "jadda" },
      { fr: "Garçon", ar: "وَلَد", translit: "walad" },
      { fr: "Fille", ar: "بِنْت", translit: "bint" },
    ],
  },
  {
    id: "maison",
    title: "La maison et l'école",
    ar: "بيت",
    description: "Maison, porte, livre, crayon, école.",
    words: [
      { fr: "Maison", ar: "بَيْت", translit: "bayt" },
      { fr: "Porte", ar: "بَاب", translit: "bab" },
      { fr: "Livre", ar: "كِتَاب", translit: "kitab" },
      { fr: "Crayon", ar: "قَلَم", translit: "qalam" },
      { fr: "École", ar: "مَدْرَسَة", translit: "madrasa" },
      { fr: "Voiture", ar: "سَيَّارَة", translit: "sayyara" },
      { fr: "Arbre", ar: "شَجَرَة", translit: "chajara" },
      { fr: "Rose", ar: "وَرْدَة", translit: "warda" },
    ],
  },
  {
    id: "table",
    title: "À table",
    ar: "أكل",
    description: "Pain, eau, lait, dattes, thé…",
    words: [
      { fr: "Pain", ar: "خُبْز", translit: "khoubz" },
      { fr: "Eau", ar: "مَاء", translit: "ma'" },
      { fr: "Lait", ar: "حَلِيب", translit: "halib" },
      { fr: "Dattes", ar: "تَمْر", translit: "tamr" },
      { fr: "Poisson", ar: "سَمَك", translit: "samak" },
      { fr: "Viande", ar: "لَحْم", translit: "lahm" },
      { fr: "Thé", ar: "شَاي", translit: "chay" },
      { fr: "Pomme", ar: "تُفَّاح", translit: "touffah" },
    ],
  },
  {
    id: "animaux",
    title: "Les animaux",
    ar: "حيوان",
    description: "Lion, chameau, chat, chien, oiseau…",
    words: [
      { fr: "Lion", ar: "أَسَد", translit: "asad" },
      { fr: "Chameau", ar: "جَمَل", translit: "jamal" },
      { fr: "Chat", ar: "قِطّ", translit: "qitt" },
      { fr: "Chien", ar: "كَلْب", translit: "kalb" },
      { fr: "Oiseau", ar: "طَيْر", translit: "tayr" },
      { fr: "Éléphant", ar: "فِيل", translit: "fil" },
      { fr: "Cheval", ar: "حِصَان", translit: "hisan" },
    ],
  },
  {
    id: "nature",
    title: "Le ciel et le corps",
    ar: "سماء",
    description: "Soleil, lune, mer, main, œil, tête.",
    words: [
      { fr: "Soleil", ar: "شَمْس", translit: "chams" },
      { fr: "Lune", ar: "قَمَر", translit: "qamar" },
      { fr: "Mer", ar: "بَحْر", translit: "bahr" },
      { fr: "Nuit", ar: "لَيْل", translit: "layl" },
      { fr: "Étoile", ar: "نَجْمَة", translit: "najma" },
      { fr: "Main", ar: "يَد", translit: "yad" },
      { fr: "Œil", ar: "عَيْن", translit: "ʿayn" },
      { fr: "Tête", ar: "رَأْس", translit: "ra's" },
    ],
  },
];

export const getTheme = (id: string) => THEMES.find((t) => t.id === id);
export const ALL_WORDS = THEMES.flatMap((t) => t.words);

/** Le chakl d'un mot : voyelles, soukoun, chadda et tanwin. */
const MARKS = /[ً-ٰٟ]/;
const isMark = (c: string) => MARKS.test(c);

/** Les lettres d'un mot, chacune avec les signes qu'elle porte. */
export function clusters(ar: string): { base: string; marks: string }[] {
  const out: { base: string; marks: string }[] = [];
  for (const c of ar) {
    if (isMark(c) && out.length > 0) out[out.length - 1].marks += c;
    else out.push({ base: c, marks: "" });
  }
  return out;
}

const QUIZ_MARKS = [HARAKAT.fatha, HARAKAT.damma, HARAKAT.kasra, HARAKAT.sukun] as const;

/** La première lettre du mot qui porte une voyelle ou un soukoun, et le signe attendu. */
export function chaklQuestion(ar: string): { base: string; answer: string } | null {
  for (const { base, marks } of clusters(ar)) {
    const answer = QUIZ_MARKS.find((m) => marks.includes(m));
    if (answer) return { base, answer };
  }
  return null;
}

export const QUIZ_CHOICES: { mark: string; name: string }[] = [
  { mark: HARAKAT.fatha, name: "Fatha" },
  { mark: HARAKAT.damma, name: "Damma" },
  { mark: HARAKAT.kasra, name: "Kasra" },
  { mark: HARAKAT.sukun, name: "Soukoun" },
];
