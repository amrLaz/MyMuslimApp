import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import SurahGate from "@/components/SurahGate";
import SurahReader from "@/components/SurahReader";
import { SURAHS, getSurah } from "@/lib/coran";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SURAHS.map((s) => ({ id: String(s.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const surah = getSurah(Number((await params).id));
  return surah ? { title: `${surah.transliteration} · Lissan` } : {};
}

export default async function SurahPage({ params }: Props) {
  const surah = getSurah(Number((await params).id));
  if (!surah) notFound();
  return (
    <AppShell back="/app/coran" backLabel="Sourates">
      <SurahGate surahId={surah.id}>
        <SurahReader key={surah.id} surah={surah} />
      </SurahGate>
    </AppShell>
  );
}
