import { redirect } from "next/navigation";
import Settings from "@/components/Settings";
import Shell from "@/components/Shell";
import { getPrefs, pageMetadata } from "@/lib/i18n-server";

export const generateMetadata = () => pageMetadata("/ajustes", (m) => ({ title: m.account.settings }), false);

export default async function Ajustes() {
  const prefs = await getPrefs();
  return <Shell>{(user) => (user ? <Settings user={user} prefs={prefs} /> : redirect("/entrar"))}</Shell>;
}
