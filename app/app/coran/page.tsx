import type { Metadata } from "next";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { SURAHS } from "@/lib/coran";

export const metadata: Metadata = { title: "Coran · Lissan" };

export default function QuranPage() {
  return (
    <AppShell back="/app" backLabel="Accueil">
      <div className="stack">
        <div>
          <h1 className="lesson-title">Coran</h1>
          <p className="muted">Écoute un verset, répète-le, puis passe au suivant.</p>
        </div>
        {SURAHS.map((s) => (
          <Link key={s.id} href={`/app/coran/${s.id}`} className="module">
            <span className="module-ar" lang="ar" dir="rtl">{s.name}</span>
            <span className="module-body">
              <span className="module-title">{s.transliteration}</span>
              <span className="muted">{s.translation} · {s.total_verses} versets</span>
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
