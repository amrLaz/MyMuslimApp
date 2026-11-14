export type Letter = {
  /** Identifiant d'URL, stable. */
  id: string;
  glyph: string;
  /** Nom de la lettre en transcription française. */
  name: string;
  /** Nom de la lettre en arabe, lu par la synthèse vocale. */
  arName: string;
  /** Syllabe avec la voyelle « a », telle qu'on la montre à l'enfant. */
  syllable: string;
  /** Repère de prononciation pour un enfant francophone. */
  hint: string;
  /** false pour les six lettres qui ne s'attachent pas à la lettre suivante. */
  connects: boolean;
  word: { ar: string; translit: string; fr: string };
  /** Consigne de tracé ; une consigne générique est utilisée sinon. */
  trace?: string;
  /** Deux lettres proches, proposées comme mauvaises réponses au quiz. */
  distractors: [string, string];
};

const TATWEEL = "ـ";

export const LETTERS: Letter[] = [
  {
    id: "alif", glyph: "ا", name: "Alif", arName: "ألف", syllable: "a",
    hint: "un « a » long, comme dans « papa »", connects: false,
    word: { ar: "أسد", translit: "Asad", fr: "Lion" },
    trace: "Trace un trait bien droit, de haut en bas.",
    distractors: ["ل", "د"],
  },
  {
    id: "ba", glyph: "ب", name: "Ba", arName: "باء", syllable: "ba",
    hint: "comme dans « bateau »", connects: true,
    word: { ar: "بابا", translit: "Baba", fr: "Papa" },
    trace: "Pars de la droite, glisse vers la gauche, puis ajoute le point en dessous.",
    distractors: ["ت", "ث"],
  },
  {
    id: "ta", glyph: "ت", name: "Ta", arName: "تاء", syllable: "ta",
    hint: "comme dans « table »", connects: true,
    word: { ar: "تمر", translit: "Tamr", fr: "Dattes" },
    trace: "Même tracé que Ba, puis ajoute deux points au-dessus.",
    distractors: ["ب", "ث"],
  },
  {
    id: "tha", glyph: "ث", name: "Tha", arName: "ثاء", syllable: "tha",
    hint: "comme le « th » anglais de « think »", connects: true,
    word: { ar: "ثلج", translit: "Thalj", fr: "Neige" },
    trace: "Même tracé que Ba, puis ajoute trois points au-dessus.",
    distractors: ["ت", "ب"],
  },
  {
    id: "jim", glyph: "ج", name: "Jim", arName: "جيم", syllable: "ja",
    hint: "comme dans « djinn »", connects: true,
    word: { ar: "جمل", translit: "Jamal", fr: "Chameau" },
    distractors: ["ح", "خ"],
  },
  {
    id: "hha", glyph: "ح", name: "Ḥa", arName: "حاء", syllable: "ḥa",
    hint: "un « h » soufflé du fond de la gorge, qui n'existe pas en français", connects: true,
    word: { ar: "حليب", translit: "Ḥalib", fr: "Lait" },
    distractors: ["ج", "خ"],
  },
  {
    id: "kha", glyph: "خ", name: "Kha", arName: "خاء", syllable: "kha",
    hint: "un son qui racle, comme la « jota » espagnole", connects: true,
    word: { ar: "خبز", translit: "Khobz", fr: "Pain" },
    distractors: ["ح", "ج"],
  },
  {
    id: "dal", glyph: "د", name: "Dal", arName: "دال", syllable: "da",
    hint: "comme dans « dame »", connects: false,
    word: { ar: "دار", translit: "Dar", fr: "Maison" },
    distractors: ["ذ", "ر"],
  },
  {
    id: "dhal", glyph: "ذ", name: "Dhal", arName: "ذال", syllable: "dha",
    hint: "comme le « th » anglais de « this »", connects: false,
    word: { ar: "ذهب", translit: "Dhahab", fr: "Or" },
    distractors: ["د", "ز"],
  },
  {
    id: "ra", glyph: "ر", name: "Ra", arName: "راء", syllable: "ra",
    hint: "un « r » roulé, comme en espagnol", connects: false,
    word: { ar: "رمل", translit: "Raml", fr: "Sable" },
    distractors: ["ز", "د"],
  },
  {
    id: "zay", glyph: "ز", name: "Zay", arName: "زاي", syllable: "za",
    hint: "comme dans « zèbre »", connects: false,
    word: { ar: "زيت", translit: "Zit", fr: "Huile" },
    distractors: ["ر", "ذ"],
  },
  {
    id: "sin", glyph: "س", name: "Sin", arName: "سين", syllable: "sa",
    hint: "comme dans « soleil »", connects: true,
    word: { ar: "سمك", translit: "Samak", fr: "Poisson" },
    distractors: ["ش", "ص"],
  },
  {
    id: "shin", glyph: "ش", name: "Chin", arName: "شين", syllable: "cha",
    hint: "comme dans « chat »", connects: true,
    word: { ar: "شمس", translit: "Chams", fr: "Soleil" },
    distractors: ["س", "ث"],
  },
  {
    id: "sad", glyph: "ص", name: "Ṣad", arName: "صاد", syllable: "ṣa",
    hint: "un « s » grave et appuyé", connects: true,
    word: { ar: "صباح", translit: "Ṣabah", fr: "Matin" },
    distractors: ["ض", "س"],
  },
  {
    id: "dad", glyph: "ض", name: "Ḍad", arName: "ضاد", syllable: "ḍa",
    hint: "un « d » grave et appuyé", connects: true,
    word: { ar: "ضوء", translit: "Ḍaw'", fr: "Lumière" },
    distractors: ["ص", "ط"],
  },
  {
    id: "tta", glyph: "ط", name: "Ṭa", arName: "طاء", syllable: "ṭa",
    hint: "un « t » grave et appuyé", connects: true,
    word: { ar: "طير", translit: "Ṭayr", fr: "Oiseau" },
    distractors: ["ظ", "ص"],
  },
  {
    id: "zza", glyph: "ظ", name: "Ẓa", arName: "ظاء", syllable: "ẓa",
    hint: "comme Dhal, en plus grave et appuyé", connects: true,
    word: { ar: "ظل", translit: "Ẓill", fr: "Ombre" },
    distractors: ["ط", "ض"],
  },
  {
    id: "ayn", glyph: "ع", name: "ʿAyn", arName: "عين", syllable: "ʿa",
    hint: "un son serré dans la gorge, qui n'existe pas en français", connects: true,
    word: { ar: "عين", translit: "ʿAyn", fr: "Œil" },
    distractors: ["غ", "ح"],
  },
  {
    id: "ghayn", glyph: "غ", name: "Ghayn", arName: "غين", syllable: "gha",
    hint: "comme le « r » français de « Paris »", connects: true,
    word: { ar: "غابة", translit: "Ghaba", fr: "Forêt" },
    distractors: ["ع", "خ"],
  },
  {
    id: "fa", glyph: "ف", name: "Fa", arName: "فاء", syllable: "fa",
    hint: "comme dans « fleur »", connects: true,
    word: { ar: "فم", translit: "Fam", fr: "Bouche" },
    distractors: ["ق", "و"],
  },
  {
    id: "qaf", glyph: "ق", name: "Qaf", arName: "قاف", syllable: "qa",
    hint: "un « k » prononcé tout au fond de la gorge", connects: true,
    word: { ar: "قمر", translit: "Qamar", fr: "Lune" },
    distractors: ["ف", "ك"],
  },
  {
    id: "kaf", glyph: "ك", name: "Kaf", arName: "كاف", syllable: "ka",
    hint: "comme dans « kiwi »", connects: true,
    word: { ar: "كتاب", translit: "Kitab", fr: "Livre" },
    distractors: ["ل", "ق"],
  },
  {
    id: "lam", glyph: "ل", name: "Lam", arName: "لام", syllable: "la",
    hint: "comme dans « lune »", connects: true,
    word: { ar: "ليل", translit: "Layl", fr: "Nuit" },
    distractors: ["ك", "ا"],
  },
  {
    id: "mim", glyph: "م", name: "Mim", arName: "ميم", syllable: "ma",
    hint: "comme dans « maman »", connects: true,
    word: { ar: "ماما", translit: "Mama", fr: "Maman" },
    distractors: ["ه", "ن"],
  },
  {
    id: "nun", glyph: "ن", name: "Noun", arName: "نون", syllable: "na",
    hint: "comme dans « nuage »", connects: true,
    word: { ar: "نور", translit: "Nour", fr: "Lumière" },
    distractors: ["ب", "ت"],
  },
  {
    id: "ha", glyph: "ه", name: "Ha", arName: "هاء", syllable: "ha",
    hint: "un « h » léger, comme dans l'anglais « hello »", connects: true,
    word: { ar: "هلال", translit: "Hilal", fr: "Croissant de lune" },
    distractors: ["م", "ح"],
  },
  {
    id: "waw", glyph: "و", name: "Waw", arName: "واو", syllable: "wa",
    hint: "comme dans « oui »", connects: false,
    word: { ar: "ورد", translit: "Ward", fr: "Roses" },
    distractors: ["ر", "ف"],
  },
  {
    id: "ya", glyph: "ي", name: "Ya", arName: "ياء", syllable: "ya",
    hint: "comme dans « yaourt »", connects: true,
    word: { ar: "يد", translit: "Yad", fr: "Main" },
    distractors: ["ب", "ن"],
  },
];

export const DEFAULT_TRACE =
  "Suis le modèle gris avec ton doigt, en partant de la droite.";

export function getLetter(id: string): Letter | undefined {
  return LETTERS.find((l) => l.id === id);
}

// Recherche par identifiant, pas par référence : une lettre passée du serveur
// à un composant client est une copie, pas l'objet de LETTERS.
function indexOfLetter(letter: Letter): number {
  return LETTERS.findIndex((l) => l.id === letter.id);
}

export function letterNumber(letter: Letter): number {
  return indexOfLetter(letter) + 1;
}

export function nextLetter(letter: Letter): Letter | undefined {
  return LETTERS[indexOfLetter(letter) + 1];
}

/**
 * Les quatre formes d'une lettre selon sa place dans le mot. Les lettres qui
 * ne s'attachent pas à la suivante gardent leur forme isolée en début de mot
 * et leur forme finale au milieu.
 */
export function letterForms(letter: Letter): { glyph: string; label: string }[] {
  const g = letter.glyph;
  return [
    { glyph: g, label: "Seule" },
    { glyph: letter.connects ? g + TATWEEL : g, label: "Début" },
    { glyph: letter.connects ? TATWEEL + g + TATWEEL : TATWEEL + g, label: "Milieu" },
    { glyph: TATWEEL + g, label: "Fin" },
  ];
}

/**
 * Les trois choix du quiz, dans un ordre fixe pour une lettre donnée (le même
 * au rendu serveur et dans le navigateur) mais qui varie d'une lettre à l'autre.
 */
export function quizOptions(letter: Letter): string[] {
  const options = [letter.glyph, ...letter.distractors];
  const shift = indexOfLetter(letter) % options.length;
  return [...options.slice(shift), ...options.slice(0, shift)];
}

/** Les signes du chakl (voyelles courtes et signes de lecture). */
export const HARAKAT = {
  fatha: "\u064E",
  damma: "\u064F",
  kasra: "\u0650",
  sukun: "\u0652",
  shadda: "\u0651",
} as const;

/**
 * La lettre avec chacune des trois voyelles courtes puis le soukoun, avec leur
 * lecture. Le alif ne porte pas de voyelle lui-même : on le montre avec sa hamza.
 */
export function letterVowels(letter: Letter): { glyph: string; say: string; name: string }[] {
  if (letter.id === "alif") {
    return [
      { glyph: "أ" + HARAKAT.fatha, say: "a", name: "fatha" },
      { glyph: "أ" + HARAKAT.damma, say: "ou", name: "damma" },
      { glyph: "إ" + HARAKAT.kasra, say: "i", name: "kasra" },
    ];
  }
  // Toutes les syllabes de la liste se terminent par « a » : le reste est la consonne.
  const stem = letter.syllable.slice(0, -1);
  const g = letter.glyph;
  return [
    { glyph: g + HARAKAT.fatha, say: stem + "a", name: "fatha" },
    { glyph: g + HARAKAT.damma, say: stem + "ou", name: "damma" },
    { glyph: g + HARAKAT.kasra, say: stem + "i", name: "kasra" },
    { glyph: g + HARAKAT.sukun, say: stem, name: "soukoun" },
  ];
}
