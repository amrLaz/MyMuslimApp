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
