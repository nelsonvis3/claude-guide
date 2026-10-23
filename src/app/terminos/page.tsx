import Shell from "@/components/Shell";
import Terms from "@/components/Terms";
import { pageMetadata } from "@/lib/i18n-server";

export const generateMetadata = () => pageMetadata("/terminos", (m) => ({ title: m.terms.title }));

export default function Terminos() {
  return <Shell>{() => <Terms />}</Shell>;
}
