import Experience from "@/components/Experience";
import Shell from "@/components/Shell";

export default function Home() {
  return <Shell>{(user) => <Experience user={user} />}</Shell>;
}
