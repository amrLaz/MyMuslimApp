"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { doneScenarios } from "@/components/ConversationPath";
import { scenarioUnlocked, type Scenario } from "@/lib/scenarios";
import { useStored } from "@/lib/store";

/** N'ouvre la situation que si le niveau précédent est terminé. */
export default function ConversationGate({ scenario, children }: { scenario: Scenario; children: ReactNode }) {
  const { ready, value } = useStored(doneScenarios);
  if (!ready) return null;
  if (scenarioUnlocked(scenario.level, value ?? [])) return <>{children}</>;
  return (
    <div className="stack">
      <h1 className="lesson-title">Niveau {scenario.level} verrouillé</h1>
      <p className="muted">Termine les deux situations du niveau {scenario.level - 1} pour l'ouvrir.</p>
      <Link href="/app/parler" className="btn-next">Voir les situations</Link>
    </div>
  );
}
