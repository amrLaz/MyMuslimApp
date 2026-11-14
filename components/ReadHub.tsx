"use client";

import Link from "next/link";
import { LETTERS } from "@/lib/alphabet";
import { ALL_WORDS } from "@/lib/mots";
import { getLetters, getWords, useStored } from "@/lib/store";

export default function ReadHub() {
  const { value } = useStored(() => ({ letters: getLetters().length, words: getWords().length }));
  const letters = value?.letters ?? 0;
  const words = value?.words ?? 0;
  return (
    <div className="stack">
      <div>
        <h1 className="lesson-title">Lire et écrire</h1>
        <p className="muted">On apprend les lettres, les voyelles, puis on écrit de vrais mots.</p>
      </div>
      <Link href="/alphabet" className="module">
        <span className="module-ar" lang="ar" dir="rtl">أ ب ت</span>
        <span className="module-body">
          <span className="module-title">L'alphabet</span>
          <span className="muted">Le son, les formes, les voyelles et le tracé de chaque lettre.</span>
          <span className="module-progress">{letters} lettre{letters > 1 ? "s" : ""} sur {LETTERS.length}</span>
        </span>
      </Link>
      <Link href="/app/ecrire" className="module">
        <span className="module-ar" lang="ar" dir="rtl">كتابة</span>
        <span className="module-body">
          <span className="module-title">Écrire des mots</span>
          <span className="muted">Un mot en français : écris-le en arabe. Lissan te corrige lettre par lettre.</span>
          <span className="module-progress">{words} mot{words > 1 ? "s" : ""} sur {ALL_WORDS.length}</span>
        </span>
      </Link>
      <Link href="/app/chakl" className="module">
        <span className="module-ar" lang="ar" dir="rtl">بَ بُ بِ</span>
        <span className="module-body">
          <span className="module-title">Le chakl</span>
          <span className="muted">Les petits signes qui disent comment lire : fatha, damma, kasra…</span>
        </span>
      </Link>
    </div>
  );
}
