import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import ConversationPath from "@/components/ConversationPath";

export const metadata: Metadata = { title: "Parler · Lissan" };

export default function TalkPage() {
  return (
    <AppShell back="/app" backLabel="Accueil">
      <div className="stack">
        <div>
          <h1 className="lesson-title">Parler</h1>
          <p className="muted">
            Trois niveaux, de plus en plus libres. Termine les deux situations d'un niveau pour
            ouvrir le suivant.
          </p>
        </div>
        <ConversationPath />
      </div>
    </AppShell>
  );
}
