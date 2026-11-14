"use client";

import Link from "next/link";
import { useEffect, useState, type PointerEvent } from "react";
import {
  DEFAULT_TRACE,
  LETTERS,
  letterForms,
  letterVowels,
  letterNumber,
  nextLetter,
  quizOptions,
  type Letter,
} from "@/lib/alphabet";
import type { CountryId } from "@/lib/countries";
import { speak } from "@/lib/speech";
import { getProfile, markLetterDone } from "@/lib/store";

const STEPS = ["letter", "voyelles", "trace", "quiz", "done"] as const;
/** Nombre de points tracés à partir duquel on considère que l'enfant a essayé. */
const MIN_TRACE_POINTS = 15;

type Point = [number, number];

function svgPoint(e: PointerEvent<SVGSVGElement>): Point {
  const r = e.currentTarget.getBoundingClientRect();
  return [((e.clientX - r.left) / r.width) * 300, ((e.clientY - r.top) / r.height) * 240];
}

export default function Lesson({ letter }: { letter: Letter }) {
  const [step, setStep] = useState(0);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [drawing, setDrawing] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [derja, setDerja] = useState<CountryId>("ma");

  useEffect(() => {
    const p = getProfile();
    if (p) setDerja(p.derja);
  }, []);

  const cur = STEPS[step];
  const next = nextLetter(letter);
  const correct = answer === letter.glyph;
  const traced = strokes.reduce((n, s) => n + s.length, 0);
  const locked =
    (cur === "trace" && traced < MIN_TRACE_POINTS) || (cur === "quiz" && !correct);

  useEffect(() => {
    if (cur === "done") markLetterDone(letter.id, letter.name);
  }, [cur, letter.id, letter.name]);

  async function say(text: string) {
    setAudioError(!(await speak(text, derja)));
  }

  function restart() {
    setStep(0);
    setStrokes([]);
    setDrawing(false);
    setAnswer(null);
  }

  function onDown(e: PointerEvent<SVGSVGElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = svgPoint(e);
    setDrawing(true);
    setStrokes((s) => [...s, [p]]);
  }

  function onMove(e: PointerEvent<SVGSVGElement>) {
    if (!drawing) return;
    const p = svgPoint(e);
    setStrokes((s) => [...s.slice(0, -1), [...s[s.length - 1], p]]);
  }

  const audioNote = audioError && (
    <p className="lesson-note" role="status">
      La lecture audio n'est pas disponible sur cet appareil.
    </p>
  );

  return (
    <main className="lesson">
      <header className="lesson-head">
        <div className="lesson-top">
          <Link href="/alphabet" className="lesson-crumb">
            ← Leçon {letterNumber(letter)} · Alphabet
          </Link>
          <span className="brand-ar" lang="ar" dir="rtl">لسان</span>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-label="Avancement de la leçon"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={step + 1}
        >
          {STEPS.map((s, i) => (
            <div key={s} className={i <= step ? "progress-bar on" : "progress-bar"} />
          ))}
        </div>
      </header>

      <div className="lesson-body">
        {cur === "letter" && (
          <>
            <div className="letter-card">
              <p className="letter-glyph" lang="ar" dir="rtl">{letter.glyph}</p>
              <h1 className="letter-name">{letter.name}</h1>
              <p className="muted">{letter.hint}</p>
            </div>
            <button type="button" className="btn-listen" onClick={() => void say(letter.arName)}>Écouter la lettre</button>
            {audioNote}
            <div>
              <p className="lesson-label">Ses 4 formes</p>
              <div className="forms">
                {letterForms(letter).map((f) => (
                  <div className="form" key={f.label}>
                    <p className="form-glyph" lang="ar" dir="rtl">{f.glyph}</p>
                    <p className="form-label">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="word">
              <div>
                <p className="caps">Premier mot</p>
                <p>{letter.word.translit} · {letter.word.fr}</p>
              </div>
              <p className="word-ar" lang="ar" dir="rtl">{letter.word.ar}</p>
            </div>
          </>
        )}

        {cur === "voyelles" && (
          <>
            <div>
              <h1 className="lesson-title">Les voyelles : le chakl</h1>
              <p className="muted">
                De petits signes, au-dessus ou en dessous de la lettre, disent comment la lire.
                On les appelle le chakl. Touche chaque case pour écouter.
              </p>
            </div>
            <div className="vowels">
              {letterVowels(letter).map((v) => (
                <button type="button" key={v.name} className="vowel" onClick={() => void say(v.glyph)}>
                  <span className="vowel-glyph" lang="ar" dir="rtl">{v.glyph}</span>
                  <span className="vowel-say">{v.say}</span>
                  <span className="vowel-name">{v.name}</span>
                </button>
              ))}
            </div>
            {audioNote}
            <ul className="legend">
              <li><strong>Fatha</strong> : un petit trait au-dessus → « a »</li>
              <li><strong>Damma</strong> : un petit « و » au-dessus → « ou »</li>
              <li><strong>Kasra</strong> : un petit trait en dessous → « i »</li>
              {letter.id !== "alif" && <li><strong>Soukoun</strong> : un petit rond au-dessus → pas de voyelle</li>}
            </ul>
          </>
        )}

        {cur === "trace" && (
          <>
            <div>
              <h1 className="lesson-title">Trace la lettre avec ton doigt</h1>
              <p className="muted">{letter.trace ?? DEFAULT_TRACE}</p>
            </div>
            <div className="trace-pad">
              <svg
                viewBox="0 0 300 240"
                role="img"
                aria-label={`Zone de tracé de la lettre ${letter.name}`}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={() => setDrawing(false)}
                onPointerCancel={() => setDrawing(false)}
              >
                <text x="150" y="165" textAnchor="middle" className="trace-model">
                  {letter.glyph}
                </text>
                {strokes.map((s, i) => (
                  <polyline
                    key={i}
                    // Un point seul (le point d'une lettre) est doublé pour être visible.
                    points={(s.length === 1 ? [s[0], s[0]] : s)
                      .map((p) => `${p[0].toFixed(0)},${p[1].toFixed(0)}`)
                      .join(" ")}
                    className="trace-stroke"
                  />
                ))}
              </svg>
            </div>
            <button type="button" className="btn-plain" onClick={() => setStrokes([])}>
              Effacer et recommencer
            </button>
          </>
        )}

        {cur === "quiz" && (
          <>
            <div>
              <h1 className="lesson-title">Quelle lettre fait « {letter.syllable} » ?</h1>
              <p className="muted">Écoute, puis touche la bonne lettre.</p>
            </div>
            <button type="button" className="btn-teal" onClick={() => void say(letterVowels(letter)[0].glyph)}>Écouter</button>
            {audioNote}
            <div className="options">
              {quizOptions(letter).map((glyph) => {
                const picked = answer === glyph;
                const state = !picked ? "" : glyph === letter.glyph ? " right" : " wrong";
                return (
                  <button
                    type="button"
                    key={glyph}
                    className={"option" + state}
                    aria-pressed={picked}
                    aria-label={LETTERS.find((l) => l.glyph === glyph)?.name}
                    onClick={() => setAnswer(glyph)}
                  >
                    <span lang="ar" dir="rtl">{glyph}</span>
                  </button>
                );
              })}
            </div>
            <p className={"feedback" + (answer ? (correct ? " right" : " wrong") : "")} role="status">
              {answer &&
                (correct
                  ? `Correct ! ${letter.glyph} fait « ${letter.syllable} ».`
                  : "Presque ! Regarde bien la forme et les points, puis réessaie.")}
            </p>
          </>
        )}

        {cur === "done" && (
          <div className="done">
            <svg viewBox="0 0 180 56" width="180" height="56" role="img" aria-label="Trois étoiles">
              <g fill="#C98A1B">
                <path d="M30 4l7.3 15 16.5 2.3-12 11.6 2.9 16.4L30 41.5 15.3 49.3l2.9-16.4-12-11.6L22.7 19z" />
                <path d="M90 4l7.3 15 16.5 2.3-12 11.6 2.9 16.4L90 41.5 75.3 49.3l2.9-16.4-12-11.6L82.7 19z" />
                <path d="M150 4l7.3 15 16.5 2.3-12 11.6 2.9 16.4L150 41.5l-14.7 7.8 2.9-16.4-12-11.6 16.5-2.3z" />
              </g>
            </svg>
            <h1 className="done-title">Bravo !</h1>
            <p className="done-text">
              Tu connais la lettre{" "}
              <span className="done-glyph" lang="ar">{letter.glyph}</span> ({letter.name}) : son,
              forme et tracé.
            </p>
            {next ? (
              <div className="next-card">
                <p className="caps">Prochaine lettre</p>
                <p className="next-glyph" lang="ar" dir="rtl">{next.glyph}</p>
                <p>{next.name} · {next.hint}</p>
              </div>
            ) : (
              <div className="next-card">
                <p className="caps">Alphabet terminé</p>
                <p>Tu as vu les 28 lettres. Tu peux revoir celles que tu veux.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="lesson-foot">
        {cur === "done" ? (
          <>
            <Link href={next ? `/alphabet/${next.id}` : "/alphabet"} className="btn-next">
              {next ? `Lettre suivante : ${next.name}` : "Revoir l'alphabet"}
            </Link>
            <button type="button" className="btn-plain" onClick={restart}>Recommencer</button>
          </>
        ) : (
          <button
            type="button"
            className="btn-next"
            disabled={locked}
            onClick={() => setStep(step + 1)}
          >
            {cur === "quiz" ? "Terminer la leçon" : "Continuer"}
          </button>
        )}
      </footer>
    </main>
  );
}
