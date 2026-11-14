"use client";

import { useEffect, useRef, useState } from "react";
import { BASMALA, RECITER, verseAudio, type Surah } from "@/lib/coran";
import { getSurahs, logActivity, setSurahKnown } from "@/lib/store";

const REPEATS = [1, 3, 5];

export default function SurahReader({ surah }: { surah: Surah }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  // Verset en cours de lecture ; 0 désigne la basmala d'ouverture.
  const [playing, setPlaying] = useState<number | null>(null);
  const [repeat, setRepeat] = useState(1);
  const [showFr, setShowFr] = useState(true);
  const [known, setKnown] = useState(false);
  const [error, setError] = useState(false);
  const session = useRef(0);

  // La Fatiha contient déjà la basmala comme premier verset.
  const hasOpening = surah.id !== 1;

  useEffect(() => {
    setKnown(getSurahs().includes(surah.id));
    return () => audio.current?.pause();
  }, [surah.id]);

  function stop() {
    session.current += 1;
    audio.current?.pause();
    setPlaying(null);
  }

  function playOne(verse: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const el = audio.current ?? new Audio();
      audio.current = el;
      el.src = verse === 0 ? verseAudio(1, 1) : verseAudio(surah.id, verse);
      el.onended = () => resolve();
      el.onerror = () => reject(new Error("audio"));
      el.play().catch(reject);
    });
  }

  async function play(verses: number[], times: number, whole: boolean) {
    stop();
    const mine = session.current;
    setError(false);
    try {
      for (const v of verses) {
        for (let n = 0; n < times; n++) {
          if (session.current !== mine) return;
          setPlaying(v);
          await playOne(v);
        }
      }
      if (session.current !== mine) return;
      if (whole) logActivity({ kind: "sourate", id: String(surah.id), label: surah.transliteration });
    } catch {
      if (session.current === mine) setError(true);
    }
    if (session.current === mine) setPlaying(null);
  }

  const all = [...(hasOpening ? [0] : []), ...surah.verses.map((v) => v.id)];

  function toggleKnown() {
    setSurahKnown(surah.id, !known);
    setKnown(!known);
  }

  return (
    <div className="stack">
      <div className="surah-head">
        <p className="surah-name" lang="ar" dir="rtl">{surah.name}</p>
        <h1 className="lesson-title">{surah.transliteration}</h1>
        <p className="muted">{surah.translation} · {surah.total_verses} versets</p>
      </div>

      <div className="surah-actions">
        {playing === null ? (
          <button type="button" className="btn-teal" onClick={() => play(all, 1, true)}>
            Écouter toute la sourate
          </button>
        ) : (
          <button type="button" className="btn-teal" onClick={stop}>Arrêter</button>
        )}
        <div className="chips" role="group" aria-label="Répéter chaque verset">
          {REPEATS.map((r) => (
            <button
              key={r}
              type="button"
              className="chip"
              aria-pressed={repeat === r}
              onClick={() => setRepeat(r)}
            >
              {r === 1 ? "1 fois" : `Répéter ×${r}`}
            </button>
          ))}
          <button type="button" className="chip" aria-pressed={showFr} onClick={() => setShowFr(!showFr)}>
            Traduction
          </button>
        </div>
      </div>

      {error && (
        <p className="feedback wrong" role="alert">
          La récitation ne se charge pas. Vérifie la connexion et réessaie.
        </p>
      )}

      <ol className="verses">
        {hasOpening && (
          <li>
            <button
              type="button"
              className={playing === 0 ? "verse on" : "verse"}
              onClick={() => play([0], repeat, false)}
            >
              <span className="verse-ar" lang="ar" dir="rtl">{BASMALA.text}</span>
              {showFr && <span className="muted">{BASMALA.translation}</span>}
            </button>
          </li>
        )}
        {surah.verses.map((v) => (
          <li key={v.id}>
            <button
              type="button"
              className={playing === v.id ? "verse on" : "verse"}
              aria-label={`Verset ${v.id}, écouter`}
              onClick={() => play([v.id], repeat, false)}
            >
              <span className="verse-ar" lang="ar" dir="rtl">
                {v.text} <span className="verse-num">{v.id}</span>
              </span>
              {showFr && <span className="muted">{v.translation}</span>}
            </button>
          </li>
        ))}
      </ol>

      <button type="button" className={known ? "btn-plain known" : "btn-plain"} aria-pressed={known} onClick={toggleKnown}>
        {known ? "Je la connais par cœur ✓" : "Je la connais par cœur"}
      </button>

      <p className="lesson-note">
        Texte : Encyclopédie du Noble Coran (lecture Hafs), jamais généré par l'IA. Récitation :{" "}
        {RECITER}. Pour le tajwid et la mémorisation, un enseignant reste indispensable.
      </p>
    </div>
  );
}
