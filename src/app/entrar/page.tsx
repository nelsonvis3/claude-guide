import { redirect } from "next/navigation";
import { auth, canLogin, passwordLogin, providerIds } from "@/auth";
import Login from "@/components/Login";
import Shell from "@/components/Shell";
import { pageMetadata } from "@/lib/i18n-server";

export const generateMetadata = () => pageMetadata("/entrar", (m) => ({ title: m.nav.login }), false);

export default async function Entrar(props: PageProps<"/entrar">) {
  if (!canLogin) redirect("/");
  if ((await auth())?.user) redirect("/#ruta");
  const { error } = await props.searchParams;
  return <Shell>{() => <Login providers={providerIds} password={passwordLogin} error={!!error} />}</Shell>;
}
