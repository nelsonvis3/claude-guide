import Link from "next/link";
import { auth, canLogin } from "@/auth";
import { CatProvider } from "@/lib/cat";
import { getAvatar } from "@/lib/db";
import { I18nProvider } from "@/lib/i18n";
import { getLang, getMessages, getPrefs } from "@/lib/i18n-server";
import Header, { type User } from "./Header";
import { Peek } from "./Mascot";

// Marco común de las páginas: idioma, sesión, header y footer.
export default async function Shell({ children }: { children: (user: User) => React.ReactNode }) {
  const lang = await getLang();
  const messages = await getMessages(lang);
  const { cat, suit } = await getPrefs();
  const session = canLogin ? await auth() : null;
  const id = session?.user?.id;
  const user: User = session?.user && id
    ? { name: session.user.name ?? "", image: (await getAvatar(id)) ?? session.user.image ?? null, provider: id.split(":")[0] }
    : null;
  return (
    <I18nProvider lang={lang} messages={messages}>
      <CatProvider cat={cat} suit={suit}>
        <Header user={user} canLogin={canLogin} />
        {children(user)}
        <footer className="relative mt-16 border-t border-line bg-surface">
          <div className="absolute -top-[58px] left-4 flex items-end gap-2 sm:left-[max(1rem,calc((100vw-72rem)/2+1rem))]">
            <Peek size={92} />
            <span className="mb-4 rounded-2xl rounded-bl-sm bg-surface px-3 py-1.5 text-[0.9rem] font-bold shadow-soft">{messages.footer.hi}</span>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 pt-12 pb-8 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <div className="col-span-2 lg:col-span-1">
              <p className="display flex items-center gap-2 text-[1.2rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/tilde/icon.png" alt="" className="size-8 rounded-full" />
                {messages.meta.title}
              </p>
              <p className="mt-2 max-w-[40ch] text-[0.95rem] text-ink-2">{messages.footer.tagline}</p>
            </div>
            {[
              { title: messages.footer.product, links: [["/#ruta", messages.nav.route], ["/examen", messages.exam.title], ["/consumo", messages.nav.usage], ["/chuleta", messages.nav.guide], ["/estudiar", messages.nav.study], ["/prompts", messages.nav.prompt]] },
              { title: messages.footer.help, links: [["/contacto?tipo=query", messages.contact.types.query], ["/contacto?tipo=complaint", messages.contact.types.complaint], ["/contacto?tipo=suggestion", messages.contact.types.suggestion]] },
              { title: messages.footer.legal, links: [["/terminos", messages.footer.terms], ["https://code.claude.com/docs", messages.nav.docs]] },
            ].map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="font-bold">{col.title}</p>
                <ul className="mt-2 grid gap-1.5 text-[0.95rem] text-ink-2">
                  {col.links.map(([href, label]) => (
                    <li key={href}><Link href={href} className="hover:text-ink hover:underline hover:underline-offset-4">{label}</Link></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="border-t border-line">
            <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-x-6 gap-y-1 px-4 py-5 text-[0.85rem] text-ink-2">
              <p>© {new Date().getFullYear()} {messages.meta.title}. {messages.footer.rights}</p>
              <p>{messages.footer.unofficial}</p>
            </div>
          </div>
        </footer>
      </CatProvider>
    </I18nProvider>
  );
}
