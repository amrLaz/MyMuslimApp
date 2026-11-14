import type { Metadata } from "next";
import Link from "next/link";
import AlphabetGrid from "@/components/AlphabetGrid";

export const metadata: Metadata = { title: "L'alphabet arabe · Lissan" };

export default function AlphabetPage() {
  return (
    <main className="alphabet">
      <header className="lesson-top">
        <Link href="/app/lire" className="lesson-crumb">← Lire et écrire</Link>
        <span className="brand-ar" lang="ar" dir="rtl">لسان</span>
      </header>
      <h1 className="lesson-title">L'alphabet arabe</h1>
      <p className="muted">
        28 lettres, une courte leçon pour chacune : le son, les formes, le tracé, puis un petit jeu.
      </p>
      <AlphabetGrid />
    </main>
  );
}
