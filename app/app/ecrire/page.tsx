import type { Metadata } from "next";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { THEMES } from "@/lib/mots";

export const metadata: Metadata = { title: "Écrire des mots · Lissan" };

export default function WritePage() {
  return (
    <AppShell back="/app/lire" backLabel="Lire et écrire">
      <div className="stack">
        <div>
          <h1 className="lesson-title">Écrire des mots</h1>
          <p className="muted">
            Choisis un thème. Lissan te donne un mot en français, tu l'écris en arabe, puis tu le
            lis avec son chakl.
          </p>
        </div>
        {THEMES.map((t) => (
          <Link key={t.id} href={`/app/ecrire/${t.id}`} className="module">
            <span className="module-ar" lang="ar" dir="rtl">{t.ar}</span>
            <span className="module-body">
              <span className="module-title">{t.title}</span>
              <span className="muted">{t.description} · {t.words.length} mots</span>
            </span>
          </Link>
        ))}
        <p className="lesson-note">
          Les mots sont en arabe littéraire : c'est l'arabe que l'on écrit à l'école. La derja se
          parle surtout, et s'écrit peu.
        </p>
      </div>
    </AppShell>
  );
}
