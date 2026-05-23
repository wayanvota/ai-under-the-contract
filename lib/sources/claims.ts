import type { ClaimRef } from "@/lib/types";

export const claimRefs: Record<string, ClaimRef> = {
  cmsPhysicianFeeSchedule: {
    id: "cmsPhysicianFeeSchedule",
    label: "CMS physician fee schedule and RVU basis",
    intendedSource: "CMS Physician Fee Schedule public use files",
    url: "TBD, verify before publication",
    retrievalDate: "Pending Wayan review",
    note: "The CPT and RVU examples are defensible only after confirming the current fee schedule and billing rules."
  },
  ffsUpcodingRange: {
    id: "ffsUpcodingRange",
    label: "FFS compliant documentation lift, modeled at $150K to $300K annually per 10,000 lives",
    intendedSource: "CMS fee schedule plus 2024-2026 analysis of office-visit coding patterns",
    url: "TBD, verify before publication",
    retrievalDate: "Pending Wayan review",
    note: "This is an editorial model range, not a published estimate for every payer contract."
  },
  cmsMsspResults: {
    id: "cmsMsspResults",
    label: "MSSP shared savings and quality-gated benchmark logic",
    intendedSource: "CMS Medicare Shared Savings Program performance year results",
    url: "TBD, verify before publication",
    retrievalDate: "Pending Wayan review",
    note: "The model assumes shared savings only after quality gates and total-cost performance clear thresholds."
  },
  msspSavingsRange: {
    id: "msspSavingsRange",
    label: "MSSP Year 3 shared savings modeled at $1M to $3M per 10,000 attributed lives",
    intendedSource: "CMS MSSP public use files and ACO public impact reports",
    url: "TBD, verify before publication",
    retrievalDate: "Pending Wayan review",
    note: "The estimate is scaled from public ACO performance patterns and must be checked against current CMS data."
  },
  cmsMaRiskAdjustment: {
    id: "cmsMaRiskAdjustment",
    label: "MA payment rises with documented HCC risk adjustment",
    intendedSource: "CMS Medicare Advantage risk adjustment methodology",
    url: "TBD, verify before publication",
    retrievalDate: "Pending Wayan review",
    note: "RAF and HCC mechanics are directionally established; dollar conversion needs current CMS benchmark validation."
  },
  emblemOigAudit: {
    id: "emblemOigAudit",
    label: "EmblemHealth OIG audit, unsupported HCC finding near 30 percent",
    intendedSource: "HHS OIG audit A-02-21-01017 or newer equivalent",
    url: "TBD, verify exact figure before publication",
    retrievalDate: "Pending Wayan review",
    note: "The UI labels this as a worked audit-risk example, not a rate for every MA plan."
  },
  medpacCodingIntensity: {
    id: "medpacCodingIntensity",
    label: "MedPAC analysis of MA coding intensity",
    intendedSource: "MedPAC report sections on Medicare Advantage coding intensity",
    url: "TBD, verify before publication",
    retrievalDate: "Pending Wayan review",
    note: "Supports the direction of coding-intensity risk, not a precise practice-level forecast."
  },
  employerPepm: {
    id: "employerPepm",
    label: "Employer direct contract modeled at $15 PEPM",
    intendedSource: "Employer health benefit spending reports and published direct-contract case studies",
    url: "TBD, verify before publication",
    retrievalDate: "Pending Wayan review",
    note: "The PEPM value is an editable model assumption for illustrating incentive design."
  },
  chronicPrevalence: {
    id: "chronicPrevalence",
    label: "Chronic disease diagnosis defaults",
    intendedSource: "CDC national chronic disease prevalence tables",
    url: "TBD, verify before publication",
    retrievalDate: "Pending Wayan review",
    note: "Defaults are chosen for a plausible primary-care panel, not a national prevalence claim."
  }
};

export const allClaimRefs = Object.values(claimRefs);
