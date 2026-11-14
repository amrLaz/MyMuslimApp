"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ArabicKeyboard from "@/components/ArabicKeyboard";
import type { CountryId } from "@/lib/countries";
import { advice, check, checkChakl, chaklAdvice, stripMarks, type ChaklCheck } from "@/lib/ecriture";
import { QUIZ_CHOICES, chaklQuestion } from "@/lib/mots";
import { LEVELS, PASS_MARK, starsFor, type Level } from "@/lib/niveaux";
import { speak } from "@/lib/speech";
import { enrollMissedWords, getProfile, logActivity, markWordsDone, saveLevelResult } from "@/lib/store";
import type { Mot } from "@/lib/mots";

type Phase = "write" | "right" | "revealed";
type Outcome = { word: Mot; ok: boolean; firstTry: boolean };

const MAX_TRIES = 2;

function evaluate(level: Level, word: Mot, text: string): ChaklCheck {
  return level.chakl ? checkChakl(word.ar, text) : { ...check(word.ar, text), marks: [] };
}

/** Une case par lettre de la réponse : juste, fausse, en trop ou manquante. */
function tilesOf(r: ChaklCheck): { text: string; cls: string }[] {
  if (r.marks.length > 0) {
    return r.marks.map((m) => ({ text: m.base + m.got, cls: m.ok ? "ok" : "wrong" }));
  }
  return r.ops.map((op) =>
    op.type === "del"
      ? { text: "؟", cls: "missing" }
      : { text: op.got!, cls: op.type === "match" ? "ok" : op.type === "sub" ? "wrong" : "extra" },
  );
}

export default function WritingSession({ level }: { level: Level }) {
  const words = level.words;
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [tries, setTries] = useState(0);
  const [phase, setPhase] = useState<Phase>("write");
  const [result, setResult] = useState<ChaklCheck | null>(null);
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
  // Aux niveaux avec chakl, l'enfant l'a déjà tapé : pas de question sur les signes.
  const question = level.chakl ? null : chaklQuestion(word.ar);
  const quizDone = !question || pick === question.answer;
  const canListen = level.audio === "always" || tries > 0 || phase !== "write";

  const succeeded = outcomes.filter((o) => o.ok).length;
  const firstTry = outcomes.filter((o) => o.firstTry).length;
  const passed = succeeded >= PASS_MARK;
  const stars = starsFor(succeeded, firstTry);

  useEffect(() => {
    if (!finished || logged.current) return;
    logged.current = true;
    const good = outcomes.filter((o) => o.ok).map((o) => o.word);
    markWordsDone(good.map((w) => stripMarks(w.ar)));
    enrollMissedWords(outcomes.filter((o) => !o.ok).map((o) => stripMarks(o.word.ar)));
    saveLevelResult(level.id, passed, stars);
    logActivity({
      kind: "ecriture",
      id: `niveau-${level.id}`,
      label: `Écriture, niveau ${level.n}`,
      words: good.map((w) => ({ ar: w.ar, translit: w.translit, fr: w.fr })),
      review: outcomes.filter((o) => !o.ok).map((o) => o.word),
      corrections: outcomes.filter((o) => !o.firstTry).length,
    });
  }, [finished, outcomes, level, passed, stars]);

  async function say(ar: string) {
    setAudioError(!(await speak(ar, derja)));
  }

  function verify() {
    const r = evaluate(level, word, text);
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

  function reset() {
    setText("");
    setTries(0);
    setPhase("write");
    setResult(null);
    setPick(null);
    setAudioError(false);
  }

  function next() {
    setOutcomes([...outcomes, { word, ok: phase === "right", firstTry: phase === "right" && tries === 0 }]);
    setI(i + 1);
    reset();
  }

  function restart() {
    logged.current = false;
    setOutcomes([]);
    setI(0);
    reset();
  }

  if (finished) {
    const nextLevel = LEVELS[level.n];
    const missed = outcomes.filter((o) => !o.ok);
    return (
      <div className="stack">
        <div className="done">
          <p className="stars" role="img" aria-label={`${stars} étoile${stars > 1 ? "s" : ""} sur 3`}>
            {"★".repeat(stars)}
            <span className="stars-off">{"★".repeat(3 - stars)}</span>
          </p>
          <h1 className="done-title">{passed ? "Niveau réussi !" : "Presque !"}</h1>
          <p className="done-text">
            {succeeded} mot{succeeded > 1 ? "s" : ""} réussi{succeeded > 1 ? "s" : ""} sur {words.length},
            dont {firstTry} du premier coup.
          </p>
          {!passed && (
            <p className="muted">
              Il faut en réussir {PASS_MARK} sur {words.length} pour passer au niveau suivant. Tu peux
              recommencer autant de fois que tu veux.
            </p>
          )}
          {passed && nextLevel && (
            <p className="muted">Le niveau {nextLevel.n} est débloqué : « {nextLevel.title} ».</p>
          )}
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
          <p className="muted">À réécrire : {missed.map((o) => o.word.fr.toLowerCase()).join(", ")}.</p>
        )}
        {passed && nextLevel ? (
          <Link href={`/app/ecrire/${nextLevel.id}`} className="btn-next">Niveau suivant</Link>
        ) : (
          <button type="button" className="btn-next" onClick={restart}>Recommencer le niveau</button>
        )}
        <Link href="/app/ecrire" className="btn-plain link-btn">Tous les niveaux</Link>
      </div>
    );
  }

  const wrong = phase === "write" && result && !result.ok && !result.nonArabic ? result : null;
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
        <p className="caps">
          Niveau {level.n} · {level.mode === "copy" ? "Recopie en arabe" : "Écris en arabe"}
          {level.chakl ? ", avec le chakl" : ""}
        </p>
        <h1 className="prompt-word">{word.fr}</h1>
        {level.mode === "copy" && phase === "write" && (
          <p className="model" lang="ar" dir="rtl">{word.ar}</p>
        )}
        {canListen && (
          <button type="button" className="replay" onClick={() => void say(word.ar)}>
            Écouter le mot
          </button>
        )}
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

          {wrong && (
            <div className="tip" role="alert">
              <div className="tiles" dir="rtl">
                {tilesOf(wrong).map((t, n) => (
                  <span key={n} lang="ar" className={"tile-l " + t.cls}>{t.text}</span>
                ))}
              </div>
              <ul className="legend">
                {(wrong.marks.length > 0 ? chaklAdvice(wrong.marks, lastTry) : advice(wrong.ops, lastTry)).map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <p className="muted">
                Essaie encore : il te reste {MAX_TRIES - tries} essai{MAX_TRIES - tries > 1 ? "s" : ""}.
              </p>
            </div>
          )}

          {!ownKeyboard && (
            <ArabicKeyboard
              chakl={level.chakl}
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
                {(result.marks.length > 0 ? chaklAdvice(result.marks, true) : advice(result.ops, true)).map((m) => (
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
