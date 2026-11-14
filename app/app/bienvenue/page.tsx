import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import Onboarding from "@/components/Onboarding";

export const metadata: Metadata = { title: "Bienvenue · Lissan" };

export default function WelcomePage() {
  return (
    <AppShell>
      <Onboarding />
    </AppShell>
  );
}
