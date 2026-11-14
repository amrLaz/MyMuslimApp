"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ArabicKeyboard from "@/components/ArabicKeyboard";
import type { CountryId } from "@/lib/countries";
import { advice, check, stripMarks, type Check } from "@/lib/ecriture";
import { QUIZ_CHOICES, chaklQuestion, type Mot, type Theme } from "@/lib/mots";
import { speak } from "@/lib/speech";
import { getProfile, logActivity, markWordsDone } from "@/lib/store";

type Phase = "write" | "right" | "revealed";
type Outcome = { word: Mot; ok: boolean; firstTry: boolean };

const MAX_TRIES = 2;

export default function WritingSession({ theme }: { theme: Theme }) {
  const words = theme.words;
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [tries, setTries] = useState(0);
  const [phase, setPhase] = useState<Phase>("write");
  const [result, setResult] = useState<Check | null>(null);
  const [ownKeyboard, setOwnKeyboard] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [derja, setDerja] = useState<CountryId>("ma");
  const [audioError, setAudioError] = useState(false);
  const logged = useRef(false);

  useEffect(() => {
    const p = getProfile();
    if (p) setDerja(p.derja);
  }, []);

  const finished = outcomes.length === words.length;
  const word = words[Math.min(i, words.length - 1)];
  const question = chaklQuestion(word.ar);
  const quizDone = !question || pick === question.answer;

  useEffect(() => {
    if (!finished || logged.current) return;
    logged.current = true;
    const good = outcomes.filter((o) => o.ok).map((o) => o.word);
    markWordsDone(good.map((w) => stripMarks(w.ar)));
    logActivity({
      kind: "ecriture",
      id: theme.id,
      label: theme.title,
      words: good.map((w) => ({ ar: w.ar, translit: w.translit, fr: w.fr })),
      review: outcomes.filter((o) => !o.ok).map((o) => o.word),
      corrections: outcomes.filter((o) => !o.firstTry).length,
    });
  }, [finished, outcomes, theme]);

  async function say(ar: string) {
    setAudioError(!(await speak(ar, derja)));
  }

  function verify() {
    const r = check(word.ar, text);
    setResult(r);
    if (r.nonArabic) return;
    if (r.ok) {
      setPhase("right");
      return;
    }
    const used = tries + 1;
    setTries(used);
    if (used >= MAX_TRIES) setPhase("revealed");
  }

  function next() {
    setOutcomes([...outcomes, { word, ok: phase === "right", firstTry: phase === "right" && tries === 0 }]);
    setI(i + 1);
    setText("");
    setTries(0);
    setPhase("write");
    setResult(null);
    setPick(null);
    setAudioError(false);
  }

  if (finished) {
    const firstTry = outcomes.filter((o) => o.firstTry).length;
    const missed = outcomes.filter((o) => !o.ok);
    return (
      <div className="stack">
        <div className="done">
          <h1 className="done-title">Bravo !</h1>
          <p className="done-text">
            {firstTry} mot{firstTry > 1 ? "s" : ""} sur {words.length} écrit{firstTry > 1 ? "s" : ""} du
            premier coup.
          </p>
        </div>
        <div className="next-card">
          <p className="caps">Les mots, avec leur chakl</p>
          <ul className="words">
            {outcomes.map((o) => (
              <li key={o.word.ar}>
                <span lang="ar" dir="rtl" className="words-ar">{o.word.ar}</span>
                <span>{o.word.translit} · {o.word.fr}</span>
              </li>
            ))}
          </ul>
        </div>
        {missed.length > 0 && (
          <p className="muted">
            À réécrire demain : {missed.map((o) => o.word.fr.toLowerCase()).join(", ")}.
          </p>
        )}
        <Link href="/app/ecrire" className="btn-next">Choisir un autre thème</Link>
        <Link href="/app/lire" className="btn-plain link-btn">Retour</Link>
      </div>
    );
  }

  const shown = phase === "write" && result && !result.ok && !result.nonArabic ? result : null;
  const lastTry = tries >= MAX_TRIES;

  return (
    <div className="stack">
      <div
        className="progress"
        role="progressbar"
        aria-label="Avancement"
        aria-valuemin={1}
        aria-valuemax={words.length}
        aria-valuenow={i + 1}
      >
        {words.map((w, n) => (
          <div key={w.ar} className={n <= i ? "progress-bar on" : "progress-bar"} />
        ))}
      </div>

      <div className="prompt-card">
        <p className="caps">Écris en arabe</p>
        <h1 className="prompt-word">{word.fr}</h1>
        <button type="button" className="replay" onClick={() => void say(word.ar)}>
          Écouter le mot
        </button>
        {audioError && <p className="lesson-note" role="status">La lecture audio n'est pas disponible.</p>}
      </div>

      {phase === "write" && (
        <>
          <label className="sr-only" htmlFor="reponse-ar">Ta réponse en arabe</label>
          <input
            id="reponse-ar"
            className="answer"
            dir="rtl"
            lang="ar"
            value={text}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            inputMode={ownKeyboard ? "text" : "none"}
            placeholder="…"
            onChange={(e) => setText(e.target.value)}
          />

          {result?.nonArabic && (
            <p className="feedback wrong" role="alert">
              Écris avec les lettres arabes : touche les lettres du clavier ci-dessous.
            </p>
          )}

          {shown && (
            <div className="tip" role="alert">
              <div className="tiles" dir="rtl">
                {shown.ops.map((op, n) =>
                  op.type === "del" ? (
                    <span key={n} className="tile-l missing" aria-label="lettre manquante">؟</span>
                  ) : (
                    <span
                      key={n}
                      lang="ar"
                      className={"tile-l " + (op.type === "match" ? "ok" : op.type === "sub" ? "wrong" : "extra")}
                    >
                      {op.got}
                    </span>
                  ),
                )}
              </div>
              <ul className="legend">
                {advice(shown.ops, lastTry).map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <p className="muted">Essaie encore : il te reste {MAX_TRIES - tries} essai{MAX_TRIES - tries > 1 ? "s" : ""}.</p>
            </div>
          )}

          {!ownKeyboard && (
            <ArabicKeyboard
              onKey={(c) => setText((t) => t + c)}
              onBackspace={() => setText((t) => [...t].slice(0, -1).join(""))}
            />
          )}
          <div className="chips">
            <button type="button" className="chip" aria-pressed={ownKeyboard} onClick={() => setOwnKeyboard(!ownKeyboard)}>
              Utiliser le clavier de mon téléphone
            </button>
          </div>
          <button type="button" className="btn-next" disabled={!text.trim()} onClick={verify}>
            Vérifier
          </button>
        </>
      )}

      {phase !== "write" && (
        <div className="stack">
          <div className="next-card">
            <p className="caps">{phase === "right" ? "Bravo, c'est juste !" : "Voilà comment s'écrit ce mot"}</p>
            <p className="solution" lang="ar" dir="rtl">{word.ar}</p>
            <p>{word.translit} · {word.fr}</p>
            {phase === "right" && result && !result.exact && (
              <p className="muted">N'oublie pas la hamza sur le alif au début du mot : « أ ».</p>
            )}
            {phase === "revealed" && result && (
              <ul className="legend">
                {advice(result.ops, true).map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
          </div>

          {phase === "right" && question && (
            <div className="next-card">
              <p className="caps">Le chakl</p>
              <p>
                Quel signe est sur la lettre{" "}
                <span lang="ar" className="words-ar">{question.base}</span> ?
              </p>
              <div className="chips">
                {QUIZ_CHOICES.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className="chip"
                    aria-pressed={pick === c.mark}
                    onClick={() => setPick(c.mark)}
                  >
                    <span lang="ar" className="mark-glyph">{"ـ" + c.mark}</span> {c.name}
                  </button>
                ))}
              </div>
              {pick && (
                <p className={"feedback " + (quizDone ? "right" : "wrong")} role="status">
                  {quizDone ? "Correct !" : "Presque ! Regarde bien le signe et réessaie."}
                </p>
              )}
            </div>
          )}

          <button type="button" className="btn-next" disabled={phase === "right" && !quizDone} onClick={next}>
            {i === words.length - 1 ? "Terminer" : "Mot suivant"}
          </button>
        </div>
      )}
    </div>
  );
}
