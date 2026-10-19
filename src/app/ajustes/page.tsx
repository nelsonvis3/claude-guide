import { redirect } from "next/navigation";
import Settings from "@/components/Settings";
import Shell from "@/components/Shell";
import { getPrefs } from "@/lib/i18n-server";

export default async function Ajustes() {
  const prefs = await getPrefs();
  return <Shell>{(user) => (user ? <Settings user={user} prefs={prefs} /> : redirect("/entrar"))}</Shell>;
}
