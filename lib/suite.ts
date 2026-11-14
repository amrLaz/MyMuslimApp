import { ALPHABET_LEVELS, LETTERS, levelUnlocked } from "./alphabet";
import { COURSE, courseUnlocked, getSurah } from "./coran";
import { LEVELS, isUnlocked } from "./niveaux";
import { SCENARIOS, scenarioUnlocked } from "./scenarios";
import type { GoalId, LevelProgress } from "./store";

export type Step = { href: string; title: string; text: string };

export type Progress = {
  letters: string[];
  levels: LevelProgress;
  talks: string[];
  surahs: number[];
};

function nextFor(goal: GoalId, p: Progress): Step | null {
  if (goal === "lire") {
    const letter = LETTERS.find(
      (l) => !p.letters.includes(l.id) && levelUnlocked(ALPHABET_LEVELS.find((a) => a.ids.includes(l.id))!.n, p.letters),
    );
    // On alterne : quelques lettres d'abord, puis l'écriture dès que le niveau 1 de l'alphabet avance.
    const level = LEVELS.find((l) => !p.levels[l.id]?.passed && isUnlocked(l, p.levels));
    if (letter && (p.letters.length < 4 || !level)) {
      return { href: `/alphabet/${letter.id}`, title: `Apprendre la lettre ${letter.name}`, text: "Son, formes, voyelles et tracé." };
    }
    if (level) {
      return { href: `/app/ecrire/${level.id}`, title: `Écriture, niveau ${level.n}`, text: level.title + "." };
    }
    return null;
  }
  if (goal === "parler") {
    const s = SCENARIOS.find((x) => !p.talks.includes(x.id) && scenarioUnlocked(x.level, p.talks));
    return s ? { href: `/app/parler/${s.id}`, title: `Parler : ${s.title}`, text: s.description } : null;
  }
  const id = COURSE.flatMap((l) => (courseUnlocked(l.n, p.surahs) ? l.ids : [])).find((x) => !p.surahs.includes(x));
  const surah = id ? getSurah(id) : undefined;
  return surah
    ? { href: `/app/coran/${surah.id}`, title: `Sourate ${surah.transliteration}`, text: "Écoute, répète, puis récite-la." }
    : null;
}

/** La prochaine chose à apprendre, en suivant d'abord les objectifs de la famille. */
export function nextStep(goals: GoalId[], p: Progress): Step | null {
  const order: GoalId[] = [...goals, ...(["lire", "parler", "coran"] as const).filter((g) => !goals.includes(g))];
  for (const goal of order) {
    const step = nextFor(goal, p);
    if (step) return step;
  }
  return null;
}
