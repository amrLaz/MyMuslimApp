import type { Metadata } from "next";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { SCENARIOS } from "@/lib/scenarios";

export const metadata: Metadata = { title: "Parler · Lissan" };

export default function TalkPage() {
  return (
    <AppShell back="/app" backLabel="Accueil">
      <div className="stack">
        <div>
          <h1 className="lesson-title">Parler</h1>
          <p className="muted">Choisis une situation. Lissan te parle, tu lui réponds à voix haute.</p>
        </div>
        {SCENARIOS.map((s) => (
          <Link key={s.id} href={`/app/parler/${s.id}`} className="module">
            <span className="module-ar" lang="ar" dir="rtl">{s.ar}</span>
            <span className="module-body">
              <span className="module-title">{s.title}</span>
              <span className="muted">{s.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
