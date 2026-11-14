"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LETTERS } from "@/lib/alphabet";
import { SURAHS } from "@/lib/coran";
import { addDays, dayKey, deckStats, dueKeys, streak } from "@/lib/revision";
import { nextStep } from "@/lib/suite";
import {
  activeDays,
  getDeck,
  getJournal,
  getLetters,
  getLevels,
  getProfile,
  getSurahs,
  getWords,
  points,
  useStored,
} from "@/lib/store";

const DAY_LETTERS = ["D", "L", "M", "M", "J", "V", "S"];

export default function AppHome() {
  const router = useRouter();
  const { ready, value } = useStored(() => {
    const journal = getJournal();
    const now = new Date();
    const days = activeDays(journal);
    const deck = getDeck();
    const talks = [...new Set(journal.filter((a) => a.kind === "conversation").map((a) => a.id))];
    return {
      profile: getProfile(),
      letters: getLetters(),
      surahs: getSurahs(),
      levels: getLevels(),
      words: getWords().length,
      talks,
      due: dueKeys(deck, now).length,
      memory: deckStats(deck),
      streak: streak(days, now),
      points: points(journal),
      doneToday: days.includes(dayKey(now)),
      week: Array.from({ length: 7 }, (_, i) => {
        const d = addDays(now, i - 6);
        return { letter: DAY_LETTERS[d.getDay()], active: days.includes(dayKey(d)), today: i === 6 };
      }),
    };
  });

  useEffect(() => {
    if (ready && !value?.profile) router.replace("/app/bienvenue");
  }, [ready, value, router]);

  if (!value?.profile) return null;
  const { profile, letters, surahs, levels, words, talks } = value;
  const step = nextStep(profile.goals, { letters, levels, talks, surahs });

  const modules = [
    {
      id: "parler",
      href: "/app/parler",
      ar: "كلام",
      title: "Parler",
      text: "Discute à voix haute avec Lissan, en derja.",
      progress: talks.length === 0 ? "Pas encore de conversation" : `${talks.length} situation${talks.length > 1 ? "s" : ""} terminée${talks.length > 1 ? "s" : ""}`,
    },
    {
      id: "lire",
      href: "/app/lire",
      ar: "كتابة",
      title: "Lire et écrire",
      text: "Les lettres, le chakl, et écrire des mots en arabe.",
      progress: `${letters.length} lettre${letters.length > 1 ? "s" : ""} sur ${LETTERS.length} · ${words} mot${words > 1 ? "s" : ""} écrit${words > 1 ? "s" : ""}`,
    },
    {
      id: "coran",
      href: "/app/coran",
      ar: "قرآن",
      title: "Coran",
      text: "Écoute et répète les courtes sourates.",
      progress: `${surahs.length} sourate${surahs.length > 1 ? "s" : ""} sur ${SURAHS.length} par cœur`,
    },
  ];
  // Les objectifs choisis par la famille passent en premier.
  modules.sort(
    (a, b) =>
      Number(profile.goals.includes(b.id as never)) - Number(profile.goals.includes(a.id as never)),
  );

  return (
    <div className="stack">
      <div>
        <h1 className="lesson-title">Salam {profile.name} !</h1>
        <p className="muted">
          {value.doneToday ? "Bravo, tu as déjà travaillé aujourd'hui." : "Cinq minutes aujourd'hui, et tu avances."}
        </p>
      </div>

      <section className="today" aria-label="Ta semaine">
        <div className="today-stats">
          <p>
            <strong>{value.streak}</strong> jour{value.streak > 1 ? "s" : ""} de suite
          </p>
          <p>
            <strong>{value.points}</strong> point{value.points > 1 ? "s" : ""}
          </p>
        </div>
        <ol className="week">
          {value.week.map((d, i) => (
            <li
              key={i}
              className={"week-day" + (d.active ? " active" : "") + (d.today ? " today-dot" : "")}
              aria-label={(d.today ? "Aujourd'hui" : `Il y a ${6 - i} jour${6 - i > 1 ? "s" : ""}`) + (d.active ? ", fait" : ", pas d'activité")}
            >
              {d.letter}
            </li>
          ))}
        </ol>
      </section>

      <section className="stack" aria-label="Ta séance du jour">
        <h2 className="alpha-level-title">Ta séance du jour</h2>
        {value.due > 0 && (
          <Link href="/app/revision" className="step primary">
            <span className="step-kicker">1 · Réviser</span>
            <span className="step-title">
              {value.due} élément{value.due > 1 ? "s" : ""} à revoir
            </span>
            <span className="step-text">Environ trois minutes, pour ne pas oublier ce que tu sais.</span>
          </Link>
        )}
        {step && (
          <Link href={step.href} className={value.due > 0 ? "step" : "step primary"}>
            <span className="step-kicker">{value.due > 0 ? "2 · Apprendre" : "Apprendre"}</span>
            <span className="step-title">{step.title}</span>
            <span className="step-text">{step.text}</span>
          </Link>
        )}
        {value.due === 0 && value.memory.total > 0 && (
          <p className="lesson-note">
            Rien à réviser aujourd'hui. {value.memory.mastered} élément{value.memory.mastered > 1 ? "s" : ""} sur{" "}
            {value.memory.total} bien mémorisé{value.memory.mastered > 1 ? "s" : ""}.
          </p>
        )}
      </section>

      <h2 className="alpha-level-title">Tout explorer</h2>
      {modules.map((m) => (
        <Link key={m.id} href={m.href} className="module">
          <span className="module-ar" lang="ar" dir="rtl">{m.ar}</span>
          <span className="module-body">
            <span className="module-title">{m.title}</span>
            <span className="muted">{m.text}</span>
            <span className="module-progress">{m.progress}</span>
          </span>
        </Link>
      ))}
      <Link href="/app/parents" className="btn-plain link-btn">Espace parents</Link>
    </div>
  );
}
