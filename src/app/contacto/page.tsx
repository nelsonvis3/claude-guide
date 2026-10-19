import Contact from "@/components/Contact";
import Shell from "@/components/Shell";

export default async function Contacto(props: PageProps<"/contacto">) {
  const { tipo } = await props.searchParams;
  return <Shell>{() => <Contact initial={typeof tipo === "string" ? tipo : "query"} />}</Shell>;
}
