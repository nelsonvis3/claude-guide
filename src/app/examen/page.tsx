import Exam from "@/components/Exam";
import Shell from "@/components/Shell";
import { getLang, getLessons } from "@/lib/i18n-server";

export default async function Examen() {
  const lessons = await getLessons(await getLang());
  return <Shell>{(user) => <Exam lessons={lessons} user={user} />}</Shell>;
}
