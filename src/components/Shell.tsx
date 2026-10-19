import { I18nProvider } from "@/lib/i18n";
import { getLang, getMessages } from "@/lib/i18n-server";
import Header from "./Header";

// Marco común de las páginas: idioma, header y footer.
export default async function Shell({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const messages = await getMessages(lang);
  return (
    <I18nProvider lang={lang} messages={messages}>
      <Header />
      {children}
      <footer className="border-t-2 border-line">
        <div className="mx-auto max-w-6xl px-4 py-8 text-[0.95rem] text-ink-2">
          <p className="max-w-[70ch]">{messages.nav.unofficial}</p>
          <a href="https://code.claude.com/docs" target="_blank" rel="noreferrer" className="mt-2 inline-block font-bold text-cobalt underline underline-offset-4">
            {messages.nav.docs}
          </a>
        </div>
      </footer>
    </I18nProvider>
  );
}
