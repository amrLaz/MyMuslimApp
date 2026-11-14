import type { Metadata } from "next";
import AppHome from "@/components/AppHome";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = { title: "Lissan" };

export default function AppPage() {
  return (
    <AppShell>
      <AppHome />
    </AppShell>
  );
}
