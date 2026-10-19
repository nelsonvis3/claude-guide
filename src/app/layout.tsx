import type { Metadata } from "next";
import { Archivo, Atkinson_Hyperlegible_Next, JetBrains_Mono } from "next/font/google";
import { getLang, getMessages, getPrefs } from "@/lib/i18n-server";
import "./globals.css";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin", "latin-ext"], axes: ["wdth"] });
const atkinson = Atkinson_Hyperlegible_Next({ variable: "--font-atkinson", subsets: ["latin", "latin-ext"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const m = await getMessages(await getLang());
  return { title: m.meta.title, description: m.meta.description };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  const { theme, accent } = await getPrefs();
  return (
    <html
      lang={lang}
      data-theme={theme === "system" ? undefined : theme}
      data-accent={accent === "violet" ? undefined : accent}
      className={`${archivo.variable} ${atkinson.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
