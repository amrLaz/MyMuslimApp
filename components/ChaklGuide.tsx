"use client";

import { useEffect, useState } from "react";
import type { CountryId } from "@/lib/countries";
import { speak } from "@/lib/speech";
import { getProfile } from "@/lib/store";

const SIGNS = [
  { name: "Fatha", glyph: "بَ", say: "ba", how: "Un petit trait au-dessus de la lettre : on dit « a »." },
  { name: "Damma", glyph: "بُ", say: "bou", how: "Un petit « و » au-dessus de la lettre : on dit « ou »." },
  { name: "Kasra", glyph: "بِ", say: "bi", how: "Un petit trait sous la lettre : on dit « i »." },
  { name: "Soukoun", glyph: "كَلْب", say: "kalb", how: "Un petit rond au-dessus : la lettre n'a pas de voyelle (ici le « l » est suivi tout de suite du « b »)." },
  { name: "Chadda", glyph: "جَدَّة", say: "jadda", how: "Un signe en forme de « w » au-dessus : la lettre se prononce deux fois (ici « dd »)." },
  { name: "Tanwin", glyph: "كِتَابٌ", say: "kitaboun", how: "Le signe est doublé à la fin du mot : on ajoute un son « n » (« oun », « an », « in »)." },
];

export default function ChaklGuide() {
  const [derja, setDerja] = useState<CountryId>("ma");
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    const p = getProfile();
    if (p) setDerja(p.derja);
  }, []);

  async function say(text: string) {
    setAudioError(!(await speak(text, derja)));
  }

  return (
    <div className="stack">
      <div>
        <h1 className="lesson-title">Le chakl</h1>
        <p className="muted">
          Le chakl, ce sont les petits signes qui disent comment lire un mot. On les trouve dans le
          Coran et dans les livres d'école. Les adultes les écrivent rarement : ils les devinent.
          Touche un exemple pour l'écouter.
        </p>
      </div>
      {SIGNS.map((s) => (
        <button key={s.name} type="button" className="module sign" onClick={() => void say(s.glyph)}>
          <span className="module-ar" lang="ar" dir="rtl">{s.glyph}</span>
          <span className="module-body">
            <span className="module-title">{s.name}</span>
            <span className="muted">{s.how}</span>
            <span className="module-progress">{s.say}</span>
          </span>
        </button>
      ))}
      {audioError && <p className="lesson-note" role="status">La lecture audio n'est pas disponible.</p>}
    </div>
  );
}
