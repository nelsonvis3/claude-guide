import Exam from "@/components/Exam";
import Shell from "@/components/Shell";
import { getLang, getLessons, pageMetadata } from "@/lib/i18n-server";

export const generateMetadata = () => pageMetadata("/examen", (m) => ({ title: m.exam.title, description: m.meta.description }));

export default async function Examen() {
  // Al navegador solo viajan las preguntas: el resto de cada lección no hace falta acá.
  const lessons = await getLessons(await getLang());
  const quizzes = Object.fromEntries(Object.entries(lessons).map(([id, l]) => [id, { quiz: l.quiz }]));
  return <Shell>{(user) => <Exam lessons={quizzes} user={user} />}</Shell>;
}
