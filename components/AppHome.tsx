"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LETTERS } from "@/lib/alphabet";
import { SURAHS } from "@/lib/coran";
import { getJournal, getLetters, getProfile, getSurahs, useStored } from "@/lib/store";

export default function AppHome() {
  const router = useRouter();
  const { ready, value } = useStored(() => ({
    profile: getProfile(),
    letters: getLetters().length,
    talks: getJournal().filter((a) => a.kind === "conversation").length,
    surahs: getSurahs().length,
  }));

  useEffect(() => {
    if (ready && !value?.profile) router.replace("/app/bienvenue");
  }, [ready, value, router]);

  if (!value?.profile) return null;
  const { profile, letters, talks, surahs } = value;

  const modules = [
    {
      id: "parler",
      href: "/app/parler",
      ar: "كلام",
      title: "Parler",
      text: "Discute à voix haute avec Lissan, en derja.",
      progress: talks === 0 ? "Pas encore de conversation" : `${talks} conversation${talks > 1 ? "s" : ""}`,
    },
    {
      id: "lire",
      href: "/alphabet",
      ar: "كتابة",
      title: "Lire et écrire",
      text: "Les lettres : leur son, leurs formes, leur tracé.",
      progress: `${letters} lettre${letters > 1 ? "s" : ""} sur ${LETTERS.length}`,
    },
    {
      id: "coran",
      href: "/app/coran",
      ar: "قرآن",
      title: "Coran",
      text: "Écoute et répète les courtes sourates.",
      progress: `${surahs} sourate${surahs > 1 ? "s" : ""} sur ${SURAHS.length} par cœur`,
    },
  ];
  // Les objectifs choisis par la famille passent en premier.
  modules.sort(
    (a, b) =>
      Number(profile.goals.includes(b.id as never)) - Number(profile.goals.includes(a.id as never)),
  );

  return (
    <div className="stack">
      <div>
        <h1 className="lesson-title">Salam {profile.name} !</h1>
        <p className="muted">Qu'est-ce qu'on fait aujourd'hui ?</p>
      </div>
      {modules.map((m) => (
        <Link key={m.id} href={m.href} className="module">
          <span className="module-ar" lang="ar" dir="rtl">{m.ar}</span>
          <span className="module-body">
            <span className="module-title">{m.title}</span>
            <span className="muted">{m.text}</span>
            <span className="module-progress">{m.progress}</span>
          </span>
        </Link>
      ))}
      <Link href="/app/parents" className="btn-plain link-btn">Espace parents</Link>
    </div>
  );
}
