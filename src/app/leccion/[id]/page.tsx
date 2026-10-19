import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Lesson from "@/components/Lesson";
import Shell from "@/components/Shell";
import { NODES } from "@/lib/content";
import { getLang, getLessons, getMessages } from "@/lib/i18n-server";

export async function generateMetadata(props: PageProps<"/leccion/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const m = await getMessages(await getLang());
  const title = (m.nodes as Record<string, { t: string }>)[id]?.t;
  return { title: title ? `${title} · ${m.meta.title}` : m.meta.title };
}

export default async function LessonPage(props: PageProps<"/leccion/[id]">) {
  const { id } = await props.params;
  if (!NODES.some((n) => n.id === id)) notFound();
  const lessons = await getLessons(await getLang());
  if (!lessons[id]) notFound();
  return <Shell>{(user) => <Lesson id={id} text={lessons[id]} user={user} />}</Shell>;
}
