import { NextResponse } from "next/server";
import { saveScenario } from "@/lib/scenarioStore";
import type { ScenarioInput } from "@/lib/types";

function validPercent(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function validateScenario(body: ScenarioInput) {
  const mix = body.contractMix;
  const diagnoses = body.diagnoses;
  if (!mix || !diagnoses || !Number.isInteger(body.panelSize) || body.panelSize < 1) {
    return false;
  }
  const mixSum = mix.ffs + mix.mssp + mix.ma + mix.employer;
  const diagnosisSum = diagnoses.hypertension + diagnoses.diabetes + diagnoses.heartFailure + diagnoses.depression;
  return (
    Math.abs(mixSum - 100) <= 0.5 &&
    diagnosisSum <= 100 &&
    Object.values(mix).every(validPercent) &&
    Object.values(diagnoses).every(validPercent)
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as ScenarioInput;

  if (!validateScenario(body)) {
    return NextResponse.json({ error: "Scenario inputs are out of range." }, { status: 400 });
  }

  const slug = await saveScenario(body);
  return NextResponse.json({ slug, url: `/s/${slug}` });
}
