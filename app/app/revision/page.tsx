import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import ReviewSession from "@/components/ReviewSession";

export const metadata: Metadata = { title: "Révision · Lissan" };

export default function ReviewPage() {
  return (
    <AppShell back="/app" backLabel="Accueil">
      <ReviewSession />
    </AppShell>
  );
}
