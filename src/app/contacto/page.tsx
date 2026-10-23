import Contact from "@/components/Contact";
import Shell from "@/components/Shell";
import { pageMetadata } from "@/lib/i18n-server";

export const generateMetadata = () => pageMetadata("/contacto", (m) => ({ title: m.contact.title, description: m.contact.lead }));

export default async function Contacto(props: PageProps<"/contacto">) {
  const { tipo } = await props.searchParams;
  return <Shell>{() => <Contact initial={typeof tipo === "string" ? tipo : "query"} />}</Shell>;
}
