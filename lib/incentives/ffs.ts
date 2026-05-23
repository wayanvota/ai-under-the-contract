import { contractColors } from "@/lib/defaults";
import type { ComparisonBlock, ContractProjection, ScenarioInput } from "@/lib/types";
import { chronicLives, clamp, dollars, livesForContract } from "./shared";

export function buildFfs(input: ScenarioInput): { comparison: ComparisonBlock; projection: ContractProjection } {
  const lives = livesForContract(input, "ffs");
  const chronic = chronicLives(input, "ffs");

  /*
   * Editorial model:
   * Fee-for-service pays for billable visit complexity and billable services,
   * so an AI documentation copilot has a rational path toward CPT support.
   * The model scales incremental revenue from the chronically complex slice of
   * the panel, then flattens after Year 2 because there is a coding ceiling.
   * Patient benefit is not assumed because payment is tied to documentation
   * and volume, not to disease control or avoided utilization.
   */
  const year1 = clamp(chronic * 52, 0, 300000);
  const year2 = clamp(chronic * 92, 0, 300000);
  const year3 = clamp(chronic * 96, 0, 300000);
  const auditYear3 = clamp(24 + input.contractMix.ffs * 0.55, 25, 58);

  return {
    comparison: {
      contract: "ffs",
      title: "Fee-for-service",
      color: contractColors.ffs,
      aiSurfaces: [
        "Document one additional chronic problem managed to support 99215 when defensible.",
        "Add diabetic foot exam G0245 if the exam was performed.",
        "Capture care-coordination time to support G2211 when rules are met."
      ],
      drives:
        "Visit-level coding lift, more documentation per encounter, and a stronger push to turn work already done into billable evidence.",
      revenueRisk:
        `${dollars(year3)} modeled annual lift by Year 3 for ${lives.toLocaleString()} FFS lives. Audit risk moves from low to medium if visit coding becomes an outlier.`,
      patientConsequence:
        "Longer encounters and possible cost-sharing increase. Chronic disease control does not improve unless clinical work changes.",
      year3Revenue: year3,
      year3AuditRisk: auditYear3,
      year3OutcomesIndex: 51,
      claimIds: ["cmsPhysicianFeeSchedule", "ffsUpcodingRange"]
    },
    projection: {
      contract: "ffs",
      title: "Fee-for-service",
      points: [
        { year: "Year 1", revenue: year1, auditRisk: 26, outcomesIndex: 50 },
        { year: "Year 2", revenue: year2, auditRisk: 38, outcomesIndex: 51 },
        { year: "Year 3", revenue: year3, auditRisk: auditYear3, outcomesIndex: 51 }
      ]
    }
  };
}
