import { contractColors } from "@/lib/defaults";
import type { ComparisonBlock, ContractProjection, ScenarioInput } from "@/lib/types";
import { dollars, livesForContract } from "./shared";

export function buildEmployer(input: ScenarioInput): { comparison: ComparisonBlock; projection: ContractProjection } {
  const lives = livesForContract(input, "employer");

  /*
   * Editorial model:
   * Employer direct contracts often pay PEPM or per-condition-managed fees
   * with contractual performance metrics. If the contract buys engagement,
   * the AI rationally drives touchpoints and reportable utilization. If the
   * contract buys outcomes, those same prompts can become care-management
   * prompts. The default model assumes engagement is easier to prove than
   * cost reduction, so renewal risk appears in Year 2 and Year 3.
   */
  const annualContract = lives * 15 * 12;
  const renewalRiskPenalty = Math.round(annualContract * 0.18);
  const year1 = annualContract;
  const year2 = annualContract - Math.round(renewalRiskPenalty * 0.35);
  const year3 = annualContract - renewalRiskPenalty;

  return {
    comparison: {
      contract: "employer",
      title: "Employer self-insured or direct",
      color: contractColors.employer,
      aiSurfaces: [
        "No app open in 14 days. Schedule outreach to protect engagement KPI.",
        "Wellness coaching session completed. Flag for the monthly employer report.",
        "Document time in care to support utilization billing."
      ],
      drives:
        "Touchpoint frequency, engagement reporting, and defensible utilization. Clinical improvement depends on what the employer contract pays for.",
      revenueRisk:
        `${dollars(annualContract)} annualized at $15 PEPM for ${lives.toLocaleString()} covered lives. Renewal risk rises if the CFO sees engagement without cost reduction.`,
      patientConsequence:
        "More messages, nudges, and coaching touches. Outcome gains are weaker unless the contract pays for measurable control or utilization change.",
      year3Revenue: year3,
      year3AuditRisk: 34,
      year3OutcomesIndex: input.contractMix.employer > 25 ? 59 : 55,
      claimIds: ["employerPepm"]
    },
    projection: {
      contract: "employer",
      title: "Employer",
      points: [
        { year: "Year 1", revenue: year1, auditRisk: 24, outcomesIndex: 54 },
        { year: "Year 2", revenue: year2, auditRisk: 29, outcomesIndex: 56 },
        { year: "Year 3", revenue: year3, auditRisk: 34, outcomesIndex: input.contractMix.employer > 25 ? 59 : 55 }
      ]
    }
  };
}
