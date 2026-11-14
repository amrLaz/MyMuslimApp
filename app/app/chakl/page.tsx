import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import ChaklGuide from "@/components/ChaklGuide";

export const metadata: Metadata = { title: "Le chakl · Lissan" };

export default function ChaklPage() {
  return (
    <AppShell back="/app/lire" backLabel="Lire et écrire">
      <ChaklGuide />
    </AppShell>
  );
}
