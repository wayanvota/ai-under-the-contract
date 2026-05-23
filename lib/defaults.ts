import type { ContractMix, DiagnosisDistribution, ScenarioInput } from "@/lib/types";

export const contractLabels = {
  ffs: "Fee-for-service",
  mssp: "MSSP",
  ma: "MA HCC",
  employer: "Employer direct"
} as const;

export const contractColors = {
  ffs: "#f97316",
  mssp: "#16a34a",
  ma: "#dc2626",
  employer: "#d97706"
} as const;

export const defaultContractMix: ContractMix = {
  ffs: 40,
  mssp: 25,
  ma: 20,
  employer: 15
};

export const defaultDiagnoses: DiagnosisDistribution = {
  hypertension: 30,
  diabetes: 15,
  heartFailure: 8,
  depression: 12
};

export const defaultScenario: ScenarioInput = {
  name: "Default LinkedIn scenario",
  contractMix: defaultContractMix,
  panelSize: 10000,
  diagnoses: defaultDiagnoses
};

export const benchmarkScenarios = [
  {
    name: "Mission-driven primary care ACO",
    contractMix: { ffs: 20, mssp: 55, ma: 15, employer: 10 },
    panelSize: 10000,
    diagnoses: defaultDiagnoses
  },
  {
    name: "Pure-growth telehealth platform",
    contractMix: { ffs: 25, mssp: 10, ma: 40, employer: 25 },
    panelSize: 10000,
    diagnoses: defaultDiagnoses
  },
  {
    name: "Regional MA primary care",
    contractMix: { ffs: 5, mssp: 5, ma: 80, employer: 10 },
    panelSize: 10000,
    diagnoses: defaultDiagnoses
  }
] satisfies ScenarioInput[];

export const contractOrder = ["ffs", "mssp", "ma", "employer"] as const;
