import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import ReadHub from "@/components/ReadHub";

export const metadata: Metadata = { title: "Lire et écrire · Lissan" };

export default function ReadPage() {
  return (
    <AppShell back="/app" backLabel="Accueil">
      <ReadHub />
    </AppShell>
  );
}
