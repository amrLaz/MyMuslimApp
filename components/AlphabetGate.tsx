"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ALPHABET_PASS, levelOfLetter, levelUnlocked, type Letter } from "@/lib/alphabet";
import { getLetters, useStored } from "@/lib/store";

/** N'ouvre la leçon que si le niveau de la lettre est débloqué. */
export default function AlphabetGate({ letter, children }: { letter: Letter; children: ReactNode }) {
  const { ready, value } = useStored(getLetters);
  const level = levelOfLetter(letter);
  if (!ready) return null;
  if (levelUnlocked(level.n, value ?? [])) return <>{children}</>;
  return (
    <main className="alphabet">
      <h1 className="lesson-title">Niveau {level.n} verrouillé</h1>
      <p className="muted">
        Apprends {ALPHABET_PASS} lettres du niveau {level.n - 1} pour ouvrir celui-ci.
      </p>
      <p>
        <Link href="/alphabet" className="btn-next">Retour à l'alphabet</Link>
      </p>
    </main>
  );
}
