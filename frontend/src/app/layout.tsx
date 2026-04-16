import type { Metadata } from "next";
import { Red_Hat_Display, Funnel_Display } from "next/font/google";
import "./globals.css";

const redHat = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-red-hat",
  display: "swap",
});

const funnel = Funnel_Display({
  subsets: ["latin"],
  variable: "--font-funnel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Animus | Plataforma de prevención mental",
  description:
    "Animus es una plataforma de IA para detectar riesgos psicosociales y suicidas en jóvenes mediante análisis de redes sociales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${redHat.variable} ${funnel.variable} antialiased bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
