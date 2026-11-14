"use client";

import Link from "next/link";
import { LEVELS, PASS_MARK, isUnlocked } from "@/lib/niveaux";
import { getLevels, useStored } from "@/lib/store";

export function Stars({ count }: { count: number }) {
  return (
    <span className="stars-small" role="img" aria-label={`${count} étoile${count > 1 ? "s" : ""} sur 3`}>
      {"★".repeat(count)}
      <span className="stars-off">{"★".repeat(3 - count)}</span>
    </span>
  );
}

export default function LevelPath() {
  const { value } = useStored(getLevels);
  const progress = value ?? {};
  return (
    <div className="stack">
      {LEVELS.map((level) => {
        const open = isUnlocked(level, progress);
        const done = progress[level.id];
        const body = (
          <>
            <span className="module-ar level-n">
              {open ? (
                level.n
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  width="28"
                  height="28"
                  role="img"
                  aria-label="Verrouillé"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
              )}
            </span>
            <span className="module-body">
              <span className="module-title">
                {level.title} {done?.passed && <Stars count={done.stars} />}
              </span>
              <span className="muted">{level.goal}</span>
              {!open && (
                <span className="module-progress">
                  Réussis {PASS_MARK} mots sur {level.words.length} au niveau {level.n - 1} pour l'ouvrir.
                </span>
              )}
            </span>
          </>
        );
        return open ? (
          <Link key={level.id} href={`/app/ecrire/${level.id}`} className="module">
            {body}
          </Link>
        ) : (
          <div key={level.id} className="module locked" aria-disabled="true">
            {body}
          </div>
        );
      })}
    </div>
  );
}
