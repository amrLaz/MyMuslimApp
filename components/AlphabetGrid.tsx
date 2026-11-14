"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ALPHABET_LEVELS, ALPHABET_PASS, LETTERS, getLetter, levelUnlocked } from "@/lib/alphabet";
import { getLetters } from "@/lib/store";

const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export default function AlphabetGrid() {
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    setDone(getLetters());
  }, []);

  return (
    <>
      <p className="alphabet-count" role="status">
        {done.length} lettre{done.length > 1 ? "s" : ""} apprise{done.length > 1 ? "s" : ""} sur{" "}
        {LETTERS.length}
      </p>
      {ALPHABET_LEVELS.map((level) => {
        const open = levelUnlocked(level.n, done);
        const learned = level.ids.filter((id) => done.includes(id)).length;
        return (
          <section key={level.n} className="alpha-level">
            <h2 className="alpha-level-title">
              Niveau {level.n} · {level.title}
              <span className="alpha-level-count">{learned}/{level.ids.length}</span>
            </h2>
            {!open && (
              <p className="lesson-note">
                Apprends {ALPHABET_PASS} lettres du niveau {level.n - 1} pour ouvrir celui-ci.
              </p>
            )}
            {/* L'arabe se lit de droite à gauche : la grille aussi. */}
            <ol className="alphabet-grid" dir="rtl">
              {level.ids.map((id) => {
                const l = getLetter(id)!;
                const learnedIt = done.includes(id);
                const inner = (
                  <>
                    <span className="tile-glyph" lang="ar">{l.glyph}</span>
                    <span className="tile-name" dir="ltr">{l.name}</span>
                  </>
                );
                return (
                  <li key={id}>
                    {open ? (
                      <Link
                        href={`/alphabet/${l.id}`}
                        className={learnedIt ? "tile learned" : "tile"}
                        aria-label={learnedIt ? `${l.name}, lettre apprise` : l.name}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <span className="tile locked" aria-disabled="true" aria-label={`${l.name}, verrouillée`}>
                        {inner}
                        <LockIcon />
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </>
  );
}
