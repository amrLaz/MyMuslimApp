"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { PASS_MARK, isUnlocked, type Level } from "@/lib/niveaux";
import { getLevels, useStored } from "@/lib/store";

/** N'affiche le niveau que si le précédent est réussi. */
export default function LevelGate({ level, children }: { level: Level; children: ReactNode }) {
  const { ready, value } = useStored(getLevels);
  if (!ready) return null;
  if (isUnlocked(level, value ?? {})) return <>{children}</>;
  return (
    <div className="stack">
      <h1 className="lesson-title">Niveau {level.n} verrouillé</h1>
      <p className="muted">
        Réussis {PASS_MARK} mots sur {level.words.length} au niveau {level.n - 1} pour l'ouvrir.
      </p>
      <Link href={`/app/ecrire/${level.n - 1}`} className="btn-next">Aller au niveau {level.n - 1}</Link>
      <Link href="/app/ecrire" className="btn-plain link-btn">Tous les niveaux</Link>
    </div>
  );
}
