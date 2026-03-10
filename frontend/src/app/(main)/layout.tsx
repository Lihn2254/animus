import type { Metadata } from "next";
import { Red_Hat_Display, Funnel_Display } from "next/font/google";
import "@/app/globals.css";
import Header from "@/app/components/Header";
import ProtectedLayout from "@/app/components/ProtectedLayout";

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
  title: "Animus",
  description: "Analizador demográfico de salud mental",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${redHat.variable} ${funnel.variable} antialiased`}
      >
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f4f1ff,#fdf8f1_35%,#f8fbff_70%)] text-slate-900">
          <div className="mx-auto flex md:w-8/12 lg:w-11/12 flex-col gap-10 px-6 pb-16 pt-8 lg:px-10">
            <Header />
            <ProtectedLayout>
              <main className="flex flex-col gap-10">{children}</main>
            </ProtectedLayout>
          </div>
        </div>
      </body>
    </html>
  );
}
