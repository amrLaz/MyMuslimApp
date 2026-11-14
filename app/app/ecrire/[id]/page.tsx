import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import WritingSession from "@/components/WritingSession";
import { THEMES, getTheme } from "@/lib/mots";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return THEMES.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const theme = getTheme((await params).id);
  return theme ? { title: `${theme.title} · Lissan` } : {};
}

export default async function WritingPage({ params }: Props) {
  const theme = getTheme((await params).id);
  if (!theme) notFound();
  return (
    <AppShell back="/app/ecrire" backLabel="Thèmes">
      <WritingSession key={theme.id} theme={theme} />
    </AppShell>
  );
}
