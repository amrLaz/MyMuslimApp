import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AlphabetGate from "@/components/AlphabetGate";
import Lesson from "@/components/Lesson";
import { LETTERS, getLetter, letterNumber } from "@/lib/alphabet";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return LETTERS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const letter = getLetter((await params).id);
  if (!letter) return {};
  return { title: `Leçon ${letterNumber(letter)} – la lettre ${letter.name} · Lissan` };
}

export default async function LessonPage({ params }: Props) {
  const letter = getLetter((await params).id);
  if (!letter) notFound();
  // La clé remet la leçon à zéro quand on passe à la lettre suivante.
  return (
    <AlphabetGate letter={letter}>
      <Lesson key={letter.id} letter={letter} />
    </AlphabetGate>
  );
}
