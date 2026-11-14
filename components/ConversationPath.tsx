"use client";

import Link from "next/link";
import { SCENARIOS, SCENARIO_LEVELS, scenarioUnlocked } from "@/lib/scenarios";
import { getJournal, useStored } from "@/lib/store";

export function doneScenarios(): string[] {
  return [...new Set(getJournal().filter((a) => a.kind === "conversation").map((a) => a.id))];
}

export default function ConversationPath() {
  const { value } = useStored(doneScenarios);
  const done = value ?? [];
  return (
    <div className="stack">
      {SCENARIO_LEVELS.map((level) => {
        const open = scenarioUnlocked(level.n, done);
        const list = SCENARIOS.filter((s) => s.level === level.n);
        return (
          <section key={level.n} className="stack">
            <h2 className="alpha-level-title">
              Niveau {level.n} · {level.title}
              <span className="alpha-level-count">{list.filter((s) => done.includes(s.id)).length}/{list.length}</span>
            </h2>
            {!open && (
              <p className="lesson-note">Termine les deux situations du niveau {level.n - 1} pour ouvrir celui-ci.</p>
            )}
            {list.map((s) => {
              const body = (
                <>
                  <span className="module-ar" lang="ar" dir="rtl">{s.ar}</span>
                  <span className="module-body">
                    <span className="module-title">
                      {s.title}
                      {done.includes(s.id) && <span className="done-tag">Terminée</span>}
                    </span>
                    <span className="muted">{s.description}</span>
                  </span>
                </>
              );
              return open ? (
                <Link key={s.id} href={`/app/parler/${s.id}`} className="module">{body}</Link>
              ) : (
                <div key={s.id} className="module locked" aria-disabled="true">{body}</div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
