import PromptMaker from "@/components/PromptMaker";
import Shell from "@/components/Shell";
import { pageMetadata } from "@/lib/i18n-server";

export const generateMetadata = () => pageMetadata("/prompts", (m) => ({ title: m.prompt.title, description: m.prompt.lead }));

export default function Prompts() {
  return <Shell>{() => <PromptMaker />}</Shell>;
}
