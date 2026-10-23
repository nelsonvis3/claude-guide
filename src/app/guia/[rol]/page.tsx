import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shell from "@/components/Shell";
import StackGuide from "@/components/StackGuide";
import { ROLE_IDS, type Role } from "@/lib/content";
import { getGuides, getLang, pageMetadata } from "@/lib/i18n-server";

export async function generateMetadata(props: PageProps<"/guia/[rol]">): Promise<Metadata> {
  const { rol } = await props.params;
  if (!ROLE_IDS.includes(rol as Role)) return {};
  const guides = await getGuides(await getLang());
  return pageMetadata(`/guia/${rol}`, (m) => ({ title: m.stackGuide.pageTitle.replace("{role}", m.roles[rol as Role].t), description: guides[rol]?.lead }));
}

export default async function GuiaPage(props: PageProps<"/guia/[rol]">) {
  const { rol } = await props.params;
  if (!ROLE_IDS.includes(rol as Role)) notFound();
  const text = (await getGuides(await getLang()))[rol];
  if (!text) notFound();
  return <Shell>{(user) => <StackGuide role={rol as Role} text={text} user={user} />}</Shell>;
}
