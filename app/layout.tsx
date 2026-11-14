import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/noto-naskh-arabic";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lissan – Tuteur IA pour l'arabe et le Coran",
  description:
    "Un tuteur vocal par IA pour les enfants de 6 à 14 ans : la derja de votre famille, l'arabe littéraire et la lecture du Coran, en quelques minutes par jour.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F6EFE3",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
