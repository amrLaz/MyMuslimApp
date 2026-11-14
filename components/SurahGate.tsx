"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { COURSE_PASS, courseLevelOf, courseUnlocked } from "@/lib/coran";
import { getSurahs, useStored } from "@/lib/store";

/** N'ouvre la sourate que si son niveau est débloqué. */
export default function SurahGate({ surahId, children }: { surahId: number; children: ReactNode }) {
  const { ready, value } = useStored(getSurahs);
  const level = courseLevelOf(surahId);
  if (!ready) return null;
  if (courseUnlocked(level.n, value ?? [])) return <>{children}</>;
  return (
    <div className="stack">
      <h1 className="lesson-title">Niveau {level.n} verrouillé</h1>
      <p className="muted">
        Sache {COURSE_PASS} sourates du niveau {level.n - 1} par cœur pour ouvrir celui-ci. Pour
        la réciter, fais-la écouter à un enseignant.
      </p>
      <Link href="/app/coran" className="btn-next">Retour aux sourates</Link>
    </div>
  );
}
