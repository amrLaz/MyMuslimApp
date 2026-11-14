import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import SurahPath from "@/components/SurahPath";

export const metadata: Metadata = { title: "Coran · Lissan" };

export default function QuranPage() {
  return (
    <AppShell back="/app" backLabel="Accueil">
      <div className="stack">
        <div>
          <h1 className="lesson-title">Coran</h1>
          <p className="muted">
            Écoute un verset, répète-le, puis passe au suivant. Quand tu sais deux sourates d'un
            niveau par cœur, le niveau suivant s'ouvre.
          </p>
        </div>
        <SurahPath />
      </div>
    </AppShell>
  );
}
