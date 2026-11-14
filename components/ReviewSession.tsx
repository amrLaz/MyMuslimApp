"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CountryId } from "@/lib/countries";
import { buildExercises, rngFrom, shuffle, type Exercise, type Option } from "@/lib/exercices";
import { dayKey, dueKeys, grade, streak } from "@/lib/revision";
import { speak } from "@/lib/speech";
import { activeDays, getDeck, getJournal, getProfile, logActivity, saveDeck } from "@/lib/store";

const SESSION_SIZE = 10;
const PRACTICE_SIZE = 8;
const MAX_RETRIES = 2;

type Mode = "loading" | "empty" | "nothing-due" | "running" | "done";

export default function ReviewSession() {
  const [mode, setMode] = useState<Mode>("loading");
  const [queue, setQueue] = useState<Exercise[]>([]);
  const [total, setTotal] = useState(0);
  const [picked, setPicked] = useState<Option | null>(null);
  const [built, setBuilt] = useState<number[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [audioFailed, setAudioFailed] = useState(false);
  const [derja, setDerja] = useState<CountryId>("ma");
  const [summary, setSummary] = useState({ right: 0, days: 0, nextDue: "" });
  // Résultat du premier essai pour chaque élément : c'est lui qui compte pour la mémoire.
  const firstTry = useRef(new Map<string, boolean>());
  const retries = useRef(new Map<string, number>());
  const practice = useRef(false);

  function start(keys: string[], isPractice: boolean) {
    const rng = rngFrom(Date.now());
    const exercises = buildExercises(isPractice ? shuffle(keys, rng).slice(0, PRACTICE_SIZE) : keys, rng);
    practice.current = isPractice;
    firstTry.current = new Map();
    retries.current = new Map();
    setQueue(exercises);
    setTotal(exercises.length);
    setPicked(null);
    setBuilt([]);
    setChecked(null);
    setMode(exercises.length > 0 ? "running" : "empty");
  }

  useEffect(() => {
    const p = getProfile();
    if (p) setDerja(p.derja);
    const deck = getDeck();
    if (Object.keys(deck).length === 0) {
      setMode("empty");
      return;
    }
    const due = dueKeys(deck, new Date()).slice(0, SESSION_SIZE);
    if (due.length === 0) {
      const next = Object.values(deck).map((c) => c.due).sort()[0];
      setSummary((s) => ({ ...s, nextDue: next }));
      setMode("nothing-due");
      return;
    }
    start(due, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ex = queue[0];

  // Les exercices d'écoute se lisent tout seuls à l'affichage.
  useEffect(() => {
    setAudioFailed(false);
    if (mode === "running" && ex?.audio) {
      void speak(ex.audio.text, derja).then((ok) => setAudioFailed(!ok));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex, mode]);

  function settle(ok: boolean) {
    if (!firstTry.current.has(ex.key)) firstTry.current.set(ex.key, ok);
    setChecked(ok);
  }

  function next() {
    // Un exercice raté revient à la fin de la séance, deux fois au plus : un
    // enfant bloqué sur un mot doit quand même pouvoir finir.
    const seen = retries.current.get(ex.key) ?? 0;
    const again = !checked && seen < MAX_RETRIES;
    if (again) retries.current.set(ex.key, seen + 1);
    const rest = again ? [...queue.slice(1), ex] : queue.slice(1);
    setPicked(null);
    setBuilt([]);
    setChecked(null);
    if (rest.length > 0) {
      setQueue(rest);
      return;
    }
    const results = [...firstTry.current.entries()];
    const right = results.filter(([, ok]) => ok).length;
    const now = new Date();
    if (!practice.current) {
      saveDeck(results.reduce((deck, [key, ok]) => grade(deck, key, ok, now), getDeck()));
    }
    logActivity({
      kind: "revision",
      id: dayKey(now),
      label: practice.current ? "Entraînement" : "Révision",
      score: right,
      corrections: results.length - right,
    });
    setSummary({ right, days: streak(activeDays(getJournal()), now), nextDue: "" });
    setQueue([]);
    setMode("done");
  }

  if (mode === "loading") return null;

  if (mode === "empty") {
    return (
      <div className="stack">
        <h1 className="lesson-title">Rien à réviser pour l'instant</h1>
        <p className="muted">
          Dès que tu apprends une lettre ou que tu écris un mot, Lissan te le fera réviser ici, au
          bon moment pour ne plus l'oublier.
        </p>
        <Link href="/alphabet" className="btn-next">Apprendre une lettre</Link>
        <Link href="/app/ecrire" className="btn-plain link-btn">Écrire des mots</Link>
      </div>
    );
  }

  if (mode === "nothing-due") {
    const today = dayKey(new Date());
    const tomorrow = summary.nextDue <= dayKey(new Date(Date.now() + 86400000));
    return (
      <div className="stack">
        <h1 className="lesson-title">Tout est révisé !</h1>
        <p className="muted">
          Prochaine révision {summary.nextDue <= today ? "bientôt" : tomorrow ? "demain" : "dans quelques jours"}.
          Revenir trop tôt n'aide pas la mémoire : c'est l'attente qui la renforce.
        </p>
        <button
          type="button"
          className="btn-plain"
          onClick={() => start(Object.keys(getDeck()), true)}
        >
          M'entraîner quand même
        </button>
        <Link href="/app" className="btn-next">Retour à l'accueil</Link>
      </div>
    );
  }

  if (mode === "done") {
    return (
      <div className="stack">
        <div className="done">
          <h1 className="done-title">Séance terminée !</h1>
          <p className="done-text">
            {summary.right} bonne{summary.right > 1 ? "s" : ""} réponse{summary.right > 1 ? "s" : ""} du
            premier coup sur {total}.
          </p>
          <p className="muted">
            {summary.days > 1
              ? `${summary.days} jours de suite : continue comme ça !`
              : "Reviens demain pour commencer une série de jours."}
          </p>
        </div>
        <p className="lesson-note">
          {practice.current
            ? "C'était un entraînement : il ne change pas tes dates de révision."
            : "Ce que tu as réussi reviendra plus tard, ce que tu as raté reviendra demain."}
        </p>
        <Link href="/app" className="btn-next">Retour à l'accueil</Link>
      </div>
    );
  }

  const answered = checked !== null;
  const builtWord = built.map((i) => ex.tiles![i]).join("");
  const done = total - queue.length;

  return (
    <div className="stack">
      <div
        className="meter"
        role="progressbar"
        aria-label="Avancement de la séance"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <div className="meter-fill" style={{ width: `${(done / total) * 100}%` }} />
      </div>

      <div className="prompt-card">
        <p className="lesson-label">{ex.prompt}</p>
        {ex.show && (
          <p className={ex.show.ar ? "model" : "prompt-word"} lang={ex.show.ar ? "ar" : undefined} dir={ex.show.ar ? "rtl" : undefined}>
            {ex.show.text}
          </p>
        )}
        {ex.audio && (
          <>
            <button type="button" className="replay" onClick={() => void speak(ex.audio!.text, derja)}>
              Réécouter
            </button>
            {audioFailed && (
              <p className="lesson-note">
                Le son ne marche pas sur cet appareil. Il fallait entendre : « {ex.audio.fallback} ».
              </p>
            )}
          </>
        )}
      </div>

      {ex.options && (
        <div className={ex.options[0].ar ? "options" : "choices"}>
          {ex.options.map((o) => {
            const state = !answered ? "" : o.correct ? " right" : o === picked ? " wrong" : "";
            return (
              <button
                key={o.label}
                type="button"
                className={(o.ar ? "option review-option" : "choice") + state}
                disabled={answered}
                aria-pressed={o === picked}
                onClick={() => {
                  setPicked(o);
                  settle(o.correct);
                }}
              >
                <span lang={o.ar ? "ar" : undefined} dir={o.ar ? "rtl" : undefined}>{o.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {ex.tiles && (
        <>
          <div className="answer build" dir="rtl" lang="ar" aria-label="Ton mot">
            {builtWord || "…"}
          </div>
          <div className="tiles" dir="rtl">
            {ex.tiles.map((t, i) => (
              <button
                key={i}
                type="button"
                className="key tile-key"
                lang="ar"
                disabled={answered || built.includes(i)}
                onClick={() => setBuilt([...built, i])}
              >
                {t}
              </button>
            ))}
          </div>
          {!answered && (
            <div className="row">
              <button type="button" className="btn-plain" disabled={built.length === 0} onClick={() => setBuilt(built.slice(0, -1))}>
                Effacer
              </button>
              <button
                type="button"
                className="btn-next"
                disabled={built.length !== ex.tiles.length}
                onClick={() => settle(builtWord === ex.answer)}
              >
                Vérifier
              </button>
            </div>
          )}
        </>
      )}

      {answered && (
        <div className={"verdict " + (checked ? "right" : "wrong")} role="status">
          <p className="verdict-title">{checked ? "Correct !" : "Pas tout à fait."}</p>
          <p className="verdict-explain">{ex.explain}</p>
          {!checked && (retries.current.get(ex.key) ?? 0) < MAX_RETRIES && (
            <p className="muted">Tu le reverras à la fin de la séance.</p>
          )}
          <button type="button" className="btn-next" onClick={next}>Continuer</button>
        </div>
      )}
    </div>
  );
}
