import { contractColors } from "@/lib/defaults";
import type { ComparisonBlock, ContractProjection, ScenarioInput } from "@/lib/types";
import { chronicLives, clamp, dollars, livesForContract } from "./shared";

export function buildMa(input: ScenarioInput): { comparison: ComparisonBlock; projection: ContractProjection } {
  const lives = livesForContract(input, "ma");
  const chronic = chronicLives(input, "ma");

  /*
   * Editorial model:
   * Medicare Advantage risk adjustment pays more when documented diagnoses
   * increase the RAF. A copilot inside this contract can look clinically
   * useful while optimizing chart completeness rather than treatment change.
   * The revenue line climbs fast because RAF lift multiplies capitated
   * payment. The audit line climbs with it because unsupported HCCs are a
   * recurring OIG finding. The model intentionally separates coding gain from
   * clinical improvement.
   */
  const baseAnnualPayment = 12000;
  const rafLiftYear1 = 0.075;
  const rafLiftYear2 = 0.115;
  const rafLiftYear3 = 0.145;
  const year1 = chronic * baseAnnualPayment * rafLiftYear1;
  const year2 = chronic * baseAnnualPayment * rafLiftYear2;
  const year3 = chronic * baseAnnualPayment * rafLiftYear3;
  const auditYear3 = clamp(48 + input.contractMix.ma * 0.62, 55, 92);

  return {
    comparison: {
      contract: "ma",
      title: "Medicare Advantage risk adjustment",
      color: contractColors.ma,
      aiSurfaces: [
        "If eGFR is under 60, consider E11.22 for diabetes with chronic kidney disease.",
        "If DSM-5 criteria are met, document F33.1 for recurrent moderate major depressive disorder.",
        "Document old myocardial infarction I25.2 annually when supported by the record."
      ],
      drives:
        "HCC capture intensification, annual wellness visits built around recoding, and coder review inside the clinical workflow.",
      revenueRisk:
        `${dollars(year3)} modeled Year 3 RAF lift for ${lives.toLocaleString()} MA lives. Audit risk is high if documentation outpaces medical-record support.`,
      patientConsequence:
        "The chart looks sicker. Care may be unchanged. Population health appearance can move without population health reality moving.",
      year3Revenue: year3,
      year3AuditRisk: auditYear3,
      year3OutcomesIndex: 52,
      claimIds: ["cmsMaRiskAdjustment", "emblemOigAudit", "medpacCodingIntensity"]
    },
    projection: {
      contract: "ma",
      title: "MA HCC",
      points: [
        { year: "Year 1", revenue: year1, auditRisk: 42, outcomesIndex: 51 },
        { year: "Year 2", revenue: year2, auditRisk: 64, outcomesIndex: 52 },
        { year: "Year 3", revenue: year3, auditRisk: auditYear3, outcomesIndex: 52 }
      ]
    }
  };
}
