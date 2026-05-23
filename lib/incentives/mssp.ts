import { contractColors } from "@/lib/defaults";
import type { ComparisonBlock, ContractProjection, ScenarioInput } from "@/lib/types";
import { chronicLives, clamp, dollars, livesForContract } from "./shared";

export function buildMssp(input: ScenarioInput): { comparison: ComparisonBlock; projection: ContractProjection } {
  const lives = livesForContract(input, "mssp");
  const chronic = chronicLives(input, "mssp");

  /*
   * Editorial model:
   * MSSP rewards total-cost reduction only when quality thresholds clear.
   * That changes the copilot's best prompt. The useful AI work is not more
   * coding for its own sake, it is finding untreated risk before it becomes
   * an ED visit or admission. Year 1 carries operating cost, Year 2 begins to
   * pay back, and Year 3 shows compounding if care management is real.
   */
  const careManagementCost = chronic * 34;
  const year1 = -careManagementCost;
  const year2 = lives * 86;
  const year3 = clamp(lives * 210, 0, 3000000);
  const auditYear3 = 18;

  return {
    comparison: {
      contract: "mssp",
      title: "Medicare Shared Savings Program",
      color: contractColors.mssp,
      aiSurfaces: [
        "BP averaged 148/92 over 3 visits. Suggest titration and pharmacist consult.",
        "HbA1c is 9.2 with no endocrinology referral. Suggest care management enrollment.",
        "Two missed follow-ups. Suggest community health worker outreach this week."
      ],
      drives:
        "Care management intensification for high-risk patients, outreach after missed visits, medication titration, and referral closure.",
      revenueRisk:
        `${dollars(year3)} modeled Year 3 shared-savings opportunity for ${lives.toLocaleString()} MSSP lives if quality gates clear. Year 1 is usually an investment year.`,
      patientConsequence:
        "Better chronic disease control by Year 2 and Year 3, with fewer avoidable ED visits and hospitalizations if execution holds.",
      year3Revenue: year3,
      year3AuditRisk: auditYear3,
      year3OutcomesIndex: 73,
      claimIds: ["cmsMsspResults", "msspSavingsRange", "chronicPrevalence"]
    },
    projection: {
      contract: "mssp",
      title: "MSSP",
      points: [
        { year: "Year 1", revenue: year1, auditRisk: 15, outcomesIndex: 55 },
        { year: "Year 2", revenue: year2, auditRisk: 16, outcomesIndex: 64 },
        { year: "Year 3", revenue: year3, auditRisk: auditYear3, outcomesIndex: 73 }
      ]
    }
  };
}
