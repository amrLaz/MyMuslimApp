"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LETTERS } from "@/lib/alphabet";
import { readProgress } from "@/lib/progress";

export default function AlphabetGrid() {
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    setDone(readProgress());
  }, []);

  return (
    <>
      <p className="alphabet-count" role="status">
        {done.length} lettre{done.length > 1 ? "s" : ""} apprise{done.length > 1 ? "s" : ""} sur{" "}
        {LETTERS.length}
      </p>
      {/* L'arabe se lit de droite à gauche : la grille aussi. */}
      <ol className="alphabet-grid" dir="rtl">
        {LETTERS.map((l) => {
          const learned = done.includes(l.id);
          return (
            <li key={l.id}>
              <Link
                href={`/alphabet/${l.id}`}
                className={learned ? "tile learned" : "tile"}
                aria-label={learned ? `${l.name}, lettre apprise` : l.name}
              >
                <span className="tile-glyph" lang="ar">{l.glyph}</span>
                <span className="tile-name" dir="ltr">{l.name}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
