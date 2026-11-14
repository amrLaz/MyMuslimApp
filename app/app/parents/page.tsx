import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import ParentSummary from "@/components/ParentSummary";

export const metadata: Metadata = { title: "Espace parents · Lissan" };

export default function ParentsPage() {
  return (
    <AppShell back="/app" backLabel="Accueil">
      <ParentSummary />
    </AppShell>
  );
}
