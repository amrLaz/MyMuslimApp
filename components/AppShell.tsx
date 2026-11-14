import Link from "next/link";
import type { ReactNode } from "react";

/** Cadre commun aux écrans de l'app : lien de retour, marque, colonne étroite. */
export default function AppShell({
  back,
  backLabel,
  children,
}: {
  back?: string;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <main className="app">
      <header className="lesson-top">
        {back ? (
          <Link href={back} className="lesson-crumb">← {backLabel}</Link>
        ) : (
          <span className="brand-name app-brand">Lissan</span>
        )}
        <span className="brand-ar" lang="ar" dir="rtl">لسان</span>
      </header>
      {children}
    </main>
  );
}
