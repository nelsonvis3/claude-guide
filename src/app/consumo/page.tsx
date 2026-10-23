import Shell from "@/components/Shell";
import Usage from "@/components/Usage";
import { pageMetadata } from "@/lib/i18n-server";

export const generateMetadata = () => pageMetadata("/consumo", (m) => ({ title: m.nav.usage, description: m.results.lead }));

export default function Consumo() {
  return <Shell>{(user) => <Usage user={user} />}</Shell>;
}
