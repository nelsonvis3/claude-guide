import Guide from "@/components/Guide";
import Shell from "@/components/Shell";
import { pageMetadata } from "@/lib/i18n-server";

export const generateMetadata = () => pageMetadata("/chuleta", (m) => ({ title: m.guide.title, description: m.guide.lead }));

export default function Chuleta() {
  return <Shell texts={["modGuide", "pluginGuide", "builtinMods", "shortcuts", "modes"]}>{() => <Guide />}</Shell>;
}
