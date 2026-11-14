// Le texte coranique n'est ni saisi à la main ni généré : il est importé tel quel
// du paquet quran-json (version figée), qui reprend le texte othmani de
// l'Encyclopédie du Noble Coran (quranenc.com), lecture Hafs.
import fatiha from "quran-json/dist/chapters/fr/1.json";
import asr from "quran-json/dist/chapters/fr/103.json";
import kawthar from "quran-json/dist/chapters/fr/108.json";
import kafirun from "quran-json/dist/chapters/fr/109.json";
import nasr from "quran-json/dist/chapters/fr/110.json";
import masad from "quran-json/dist/chapters/fr/111.json";
import ikhlas from "quran-json/dist/chapters/fr/112.json";
import falaq from "quran-json/dist/chapters/fr/113.json";
import nas from "quran-json/dist/chapters/fr/114.json";

export type Verse = { id: number; text: string; translation: string };
export type Surah = {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  total_verses: number;
  verses: Verse[];
};

// Dans l'ordre où on les apprend d'habitude : la Fatiha, puis les plus courtes.
export const SURAHS: Surah[] = [fatiha, ikhlas, falaq, nas, kawthar, asr, nasr, masad, kafirun];

export const getSurah = (id: number) => SURAHS.find((s) => s.id === id);

/** La basmala, récitée en tête des sourates (premier verset de la Fatiha). */
export const BASMALA: Verse = fatiha.verses[0];

export const RECITER = "Mahmoud Khalil Al-Husary";

/** Récitation verset par verset, hébergée par everyayah.com. */
export function verseAudio(surah: number, verse: number): string {
  const pad = (n: number) => String(n).padStart(3, "0");
  return `https://everyayah.com/data/Husary_128kbps/${pad(surah)}${pad(verse)}.mp3`;
}

/** Nombre de sourates sues par cœur d'un niveau pour ouvrir le suivant. */
export const COURSE_PASS = 2;

export const COURSE = [
  { n: 1, title: "Les premières sourates", ids: [1, 112, 108] },
  { n: 2, title: "Les courtes sourates", ids: [113, 114, 103] },
  { n: 3, title: "Pour aller plus loin", ids: [110, 109, 111] },
];

export const courseLevelOf = (surahId: number) => COURSE.find((l) => l.ids.includes(surahId))!;

export function courseUnlocked(n: number, known: number[]): boolean {
  if (n <= 1) return true;
  return COURSE[n - 2].ids.filter((id) => known.includes(id)).length >= COURSE_PASS;
}
