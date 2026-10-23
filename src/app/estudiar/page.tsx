import Shell from "@/components/Shell";
import Study from "@/components/Study";
import { pageMetadata } from "@/lib/i18n-server";

export const generateMetadata = () => pageMetadata("/estudiar", (m) => ({ title: m.study.title, description: m.study.lead }));

export default function Estudiar() {
  return <Shell texts={["study"]}>{() => <Study />}</Shell>;
}
