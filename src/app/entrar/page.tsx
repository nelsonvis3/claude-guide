import { redirect } from "next/navigation";
import { auth, canLogin, passwordLogin, providerIds } from "@/auth";
import Login from "@/components/Login";
import Shell from "@/components/Shell";

export default async function Entrar(props: PageProps<"/entrar">) {
  if (!canLogin) redirect("/");
  if ((await auth())?.user) redirect("/#ruta");
  const { error } = await props.searchParams;
  return <Shell>{() => <Login providers={providerIds} password={passwordLogin} error={!!error} />}</Shell>;
}
