import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import LevelPath from "@/components/LevelPath";

export const metadata: Metadata = { title: "Écrire des mots · Lissan" };

export default function WritePage() {
  return (
    <AppShell back="/app/lire" backLabel="Lire et écrire">
      <div className="stack">
        <div>
          <h1 className="lesson-title">Écrire des mots</h1>
          <p className="muted">
            Cinq niveaux, du plus facile au plus difficile. Réussis 6 mots sur 8 pour ouvrir le niveau
            suivant, et gagne jusqu'à trois étoiles.
          </p>
        </div>
        <LevelPath />
        <p className="lesson-note">
          Les mots sont en arabe littéraire : c'est l'arabe que l'on écrit à l'école. La derja se
          parle surtout, et s'écrit peu.
        </p>
      </div>
    </AppShell>
  );
}
