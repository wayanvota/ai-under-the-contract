import Simulator from "@/components/Simulator";
import { defaultScenario } from "@/lib/defaults";

export default function Home() {
  return <Simulator initialScenario={defaultScenario} />;
}
