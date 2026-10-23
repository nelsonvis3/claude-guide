import { auth, canLogin } from "@/auth";
import Settings from "@/components/Settings";
import Shell from "@/components/Shell";
import { getPrefs, pageMetadata } from "@/lib/i18n-server";

export const generateMetadata = () => pageMetadata("/ajustes", (m) => ({ title: m.account.settings }), false);

// Sin cuenta también: apariencia, color de Tilde y Restaurar. Lo de la cuenta (perfil, trajes, avisos, seguridad) pide sesión.
export default async function Ajustes() {
  const session = canLogin ? await auth() : null;
  const prefs = await getPrefs(session?.user?.id);
  return <Shell>{(user) => <Settings user={user} prefs={prefs} />}</Shell>;
}
