"use client";

import Link from "next/link";
import { COURSE, COURSE_PASS, courseUnlocked, getSurah } from "@/lib/coran";
import { getSurahs, useStored } from "@/lib/store";

export default function SurahPath() {
  const { value } = useStored(getSurahs);
  const known = value ?? [];
  return (
    <div className="stack">
      {COURSE.map((level) => {
        const open = courseUnlocked(level.n, known);
        return (
          <section key={level.n} className="stack">
            <h2 className="alpha-level-title">
              Niveau {level.n} · {level.title}
              <span className="alpha-level-count">
                {level.ids.filter((id) => known.includes(id)).length}/{level.ids.length}
              </span>
            </h2>
            {!open && (
              <p className="lesson-note">
                Sache {COURSE_PASS} sourates du niveau {level.n - 1} par cœur pour ouvrir celui-ci.
              </p>
            )}
            {level.ids.map((id) => {
              const s = getSurah(id)!;
              const body = (
                <>
                  <span className="module-ar" lang="ar" dir="rtl">{s.name}</span>
                  <span className="module-body">
                    <span className="module-title">
                      {s.transliteration}
                      {known.includes(id) && <span className="done-tag">Sue par cœur</span>}
                    </span>
                    <span className="muted">{s.translation} · {s.total_verses} versets</span>
                  </span>
                </>
              );
              return open ? (
                <Link key={id} href={`/app/coran/${id}`} className="module">{body}</Link>
              ) : (
                <div key={id} className="module locked" aria-disabled="true">{body}</div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
