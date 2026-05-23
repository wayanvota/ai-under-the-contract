import type { ContractKey, DiagnosisDistribution, ScenarioInput } from "@/lib/types";

export function livesForContract(input: ScenarioInput, contract: ContractKey) {
  return Math.round((input.panelSize * input.contractMix[contract]) / 100);
}

export function chronicLives(input: ScenarioInput, contract: ContractKey) {
  const diagnosisShare = Math.min(100, diagnosisTotal(input.diagnoses)) / 100;
  return Math.round(livesForContract(input, contract) * diagnosisShare);
}

export function diagnosisTotal(diagnoses: DiagnosisDistribution) {
  return diagnoses.hypertension + diagnoses.diabetes + diagnoses.heartFailure + diagnoses.depression;
}

export function dollars(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function percent(value: number) {
  return `${Math.round(value)}%`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
