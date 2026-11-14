import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import Conversation from "@/components/Conversation";
import { SCENARIOS, getScenario } from "@/lib/scenarios";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SCENARIOS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const scenario = getScenario((await params).id);
  return scenario ? { title: `${scenario.title} · Lissan` } : {};
}

export default async function ConversationPage({ params }: Props) {
  const scenario = getScenario((await params).id);
  if (!scenario) notFound();
  return (
    <AppShell back="/app/parler" backLabel="Situations">
      <Conversation scenario={scenario} />
    </AppShell>
  );
}
