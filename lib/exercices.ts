import { LETTERS, getLetter } from "./alphabet";
import { stripMarks } from "./ecriture";
import { ALL_WORDS } from "./mots";

export type Option = { label: string; ar: boolean; correct: boolean };

export type Exercise = {
  /** Clé de l'élément révisé dans le paquet de révision. */
  key: string;
  prompt: string;
  /** Ce qui est montré en grand (une lettre, un mot), s'il y a lieu. */
  show?: { text: string; ar: boolean };
  /** Texte arabe lu à voix haute à l'affichage ; `fallback` s'affiche si l'audio manque. */
  audio?: { text: string; fallback: string };
  /** Choix multiples. */
  options?: Option[];
  /** Lettres à remettre dans l'ordre, et la réponse attendue. */
  tiles?: string[];
  answer?: string;
  /** Rappel affiché après la réponse, juste ou fausse. */
  explain: string;
};

export type Rng = () => number;

/** Générateur pseudo-aléatoire reproductible (mulberry32). */
export function rngFrom(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(list: T[], rng: Rng): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function letterExercise(id: string, rng: Rng): Exercise | null {
  const letter = getLetter(id);
  if (!letter) return null;
  const others = letter.distractors.map((g) => LETTERS.find((l) => l.glyph === g)!);
  // Le français d'abord : une ligne qui commence par de l'arabe s'afficherait de droite à gauche.
  const explain = `${letter.name} (${letter.glyph}) : ${letter.hint}.`;
  const key = `l:${id}`;
  if (rng() < 0.5) {
    return {
      key,
      prompt: "Quelle est cette lettre ?",
      show: { text: letter.glyph, ar: true },
      options: shuffle(
        [letter, ...others].map((l) => ({ label: l.name, ar: false, correct: l === letter })),
        rng,
      ),
      explain,
    };
  }
  return {
    key,
    prompt: "Écoute, puis touche la bonne lettre.",
    audio: { text: letter.arName, fallback: letter.name },
    options: shuffle(
      [letter, ...others].map((l) => ({ label: l.glyph, ar: true, correct: l === letter })),
      rng,
    ),
    explain,
  };
}

function wordExercise(skeleton: string, rng: Rng): Exercise | null {
  const word = ALL_WORDS.find((w) => stripMarks(w.ar) === skeleton);
  if (!word) return null;
  const key = `m:${skeleton}`;
  const explain = `${word.fr} : ${word.ar} (${word.translit})`;
  // Deux autres mots, de sens différent, comme mauvaises réponses.
  const others = shuffle(ALL_WORDS.filter((w) => w.fr !== word.fr && w.ar !== word.ar), rng).slice(0, 2);
  const type = Math.floor(rng() * 4);
  if (type === 0) {
    return {
      key,
      prompt: "Que veut dire ce mot ?",
      show: { text: word.ar, ar: true },
      options: shuffle([word, ...others].map((w) => ({ label: w.fr, ar: false, correct: w === word })), rng),
      explain,
    };
  }
  if (type === 1) {
    return {
      key,
      prompt: "Comment écrit-on ce mot en arabe ?",
      show: { text: word.fr, ar: false },
      options: shuffle([word, ...others].map((w) => ({ label: w.ar, ar: true, correct: w === word })), rng),
      explain,
    };
  }
  if (type === 2) {
    return {
      key,
      prompt: "Écoute, puis touche ce que tu as entendu.",
      audio: { text: word.ar, fallback: word.translit },
      options: shuffle([word, ...others].map((w) => ({ label: w.fr, ar: false, correct: w === word })), rng),
      explain,
    };
  }
  const letters = [...skeleton];
  let tiles = shuffle(letters, rng);
  // Un mélange qui redonne le mot n'est pas un exercice : on décale d'une lettre.
  if (tiles.join("") === skeleton) tiles = [...tiles.slice(1), tiles[0]];
  return {
    key,
    prompt: `Remets les lettres dans l'ordre pour écrire « ${word.fr.toLowerCase()} ».`,
    tiles,
    answer: skeleton,
    explain,
  };
}

/** Un exercice par élément à réviser, de type varié. */
export function buildExercises(keys: string[], rng: Rng): Exercise[] {
  return keys.flatMap((key) => {
    const [kind, id] = [key.slice(0, 1), key.slice(2)];
    const ex = kind === "l" ? letterExercise(id, rng) : wordExercise(id, rng);
    return ex ? [ex] : [];
  });
}
