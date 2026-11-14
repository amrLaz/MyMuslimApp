import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import LevelGate from "@/components/LevelGate";
import WritingSession from "@/components/WritingSession";
import { LEVELS, getLevel } from "@/lib/niveaux";

type Props = { params: Promise<{ niveau: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return LEVELS.map((l) => ({ niveau: l.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const level = getLevel((await params).niveau);
  return level ? { title: `Niveau ${level.n} · Lissan` } : {};
}

export default async function LevelPage({ params }: Props) {
  const level = getLevel((await params).niveau);
  if (!level) notFound();
  return (
    <AppShell back="/app/ecrire" backLabel="Niveaux">
      <LevelGate level={level}>
        <WritingSession key={level.id} level={level} />
      </LevelGate>
    </AppShell>
  );
}
