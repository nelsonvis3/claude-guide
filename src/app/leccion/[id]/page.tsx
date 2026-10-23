import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Lesson from "@/components/Lesson";
import Shell from "@/components/Shell";
import { NODES } from "@/lib/content";
import { getLang, getLessons, pageMetadata } from "@/lib/i18n-server";

export async function generateMetadata(props: PageProps<"/leccion/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  if (!NODES.some((n) => n.id === id)) return {};
  return pageMetadata(`/leccion/${id}`, (m) => {
    const n = (m.nodes as Record<string, { t: string; d: string }>)[id];
    return { title: n.t, description: n.d };
  });
}

export default async function LessonPage(props: PageProps<"/leccion/[id]">) {
  const { id } = await props.params;
  if (!NODES.some((n) => n.id === id)) notFound();
  const lessons = await getLessons(await getLang());
  if (!lessons[id]) notFound();
  return <Shell>{(user) => <Lesson id={id} text={lessons[id]} user={user} />}</Shell>;
}
