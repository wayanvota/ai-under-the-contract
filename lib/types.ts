export type ContractKey = "ffs" | "mssp" | "ma" | "employer";

export type ContractMix = Record<ContractKey, number>;

export type DiagnosisDistribution = {
  hypertension: number;
  diabetes: number;
  heartFailure: number;
  depression: number;
};

export type ScenarioInput = {
  name?: string;
  contractMix: ContractMix;
  panelSize: number;
  diagnoses: DiagnosisDistribution;
};

export type ClaimRef = {
  id: string;
  label: string;
  intendedSource: string;
  url: string;
  retrievalDate: string;
  note: string;
};

export type ComparisonBlock = {
  contract: ContractKey;
  title: string;
  color: string;
  aiSurfaces: string[];
  drives: string;
  revenueRisk: string;
  patientConsequence: string;
  year3Revenue: number;
  year3AuditRisk: number;
  year3OutcomesIndex: number;
  claimIds: string[];
};

export type ProjectionPoint = {
  year: "Year 1" | "Year 2" | "Year 3";
  revenue: number;
  auditRisk: number;
  outcomesIndex: number;
};

export type ContractProjection = {
  contract: ContractKey;
  title: string;
  points: ProjectionPoint[];
};

export type ScenarioResult = {
  comparisons: Record<ContractKey, ComparisonBlock>;
  projections: ContractProjection[];
};

export type StoredScenario = {
  slug: string;
  contractMix: ContractMix;
  panelSize: number;
  diagnoses: DiagnosisDistribution;
  createdAt?: string;
};
