import Shell from "@/components/Shell";
import { GuideIndex } from "@/components/StackGuide";
import { pageMetadata } from "@/lib/i18n-server";

export const generateMetadata = () => pageMetadata("/guia", (m) => ({ title: m.stackGuide.title, description: m.stackGuide.lead }));

export default function Guias() {
  return <Shell>{(user) => <GuideIndex user={user} />}</Shell>;
}
