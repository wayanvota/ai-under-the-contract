import { notFound } from "next/navigation";
import Simulator from "@/components/Simulator";
import { getScenario } from "@/lib/scenarioStore";

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function SharedScenarioPage({ params }: PageProps) {
  const scenario = await getScenario(params.slug);

  if (!scenario) {
    notFound();
  }

  return <Simulator initialScenario={scenario} sharedSlug={params.slug} />;
}
