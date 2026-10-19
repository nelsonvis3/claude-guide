import PromptMaker from "@/components/PromptMaker";
import Shell from "@/components/Shell";

export default function Prompts() {
  return <Shell>{() => <PromptMaker />}</Shell>;
}
