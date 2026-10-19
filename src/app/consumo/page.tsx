import Shell from "@/components/Shell";
import Usage from "@/components/Usage";

export default function Consumo() {
  return <Shell>{(user) => <Usage user={user} />}</Shell>;
}
