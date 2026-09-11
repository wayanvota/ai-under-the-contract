import { notFound } from "next/navigation";
import Simulator from "@/components/Simulator";
import { getScenario } from "@/lib/scenarioStore";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function SharedScenarioPage({ params }: PageProps) {
  const { slug } = await params;
  const scenario = await getScenario(slug);

  if (!scenario) {
    notFound();
  }

  return <Simulator initialScenario={scenario} sharedSlug={slug} />;
}
