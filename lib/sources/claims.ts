import type { ClaimRef } from "@/lib/types";

export const claimRefs: Record<string, ClaimRef> = {
  cmsPhysicianFeeSchedule: {
    id: "cmsPhysicianFeeSchedule",
    label: "CMS physician fee schedule and RVU basis",
    intendedSource: "CMS Physician Fee Schedule relative value files and national payment amount files",
    url: "https://www.cms.gov/medicare/payment/fee-schedules/physician/pfs-relative-value-files",
    retrievalDate: "May 23, 2026",
    note: "Verified source for the PFS and RVU basis. The simulator's FFS revenue lift remains a modeled estimate, not a CMS-published lift."
  },
  ffsUpcodingRange: {
    id: "ffsUpcodingRange",
    label: "FFS compliant documentation lift, modeled at $150K to $300K annually per 10,000 lives",
    intendedSource: "CMS PFS files plus simulator arithmetic",
    url: "https://www.cms.gov/medicare/payment/fee-schedules/physician/national-payment-amount-file",
    retrievalDate: "May 23, 2026",
    note: "Modeled estimate. CMS verifies the fee schedule basis, but the $150K to $300K lift is scenario arithmetic and should be described as modeled."
  },
  cmsMsspResults: {
    id: "cmsMsspResults",
    label: "MSSP shared savings and quality-gated benchmark logic",
    intendedSource: "CMS Medicare Shared Savings Program performance year results",
    url: "https://data.cms.gov/medicare-shared-savings-program/performance-year-financial-and-quality-results",
    retrievalDate: "May 23, 2026",
    note: "Verified CMS source for ACO-level financial and quality results. CMS reports 2024 as the latest data available on the dataset page."
  },
  msspSavingsRange: {
    id: "msspSavingsRange",
    label: "MSSP Year 3 shared savings modeled at $1M to $3M per 10,000 attributed lives",
    intendedSource: "CMS MSSP public use file plus simulator scaling",
    url: "https://data.cms.gov/medicare-shared-savings-program/performance-year-financial-and-quality-results",
    retrievalDate: "May 23, 2026",
    note: "Modeled estimate. CMS verifies the shared-savings data source and program mechanics; the per-10,000-lives Year 3 range is simulator scaling."
  },
  cmsMaRiskAdjustment: {
    id: "cmsMaRiskAdjustment",
    label: "MA payment rises with documented HCC risk adjustment",
    intendedSource: "CMS Medicare Advantage risk adjustment methodology",
    url: "https://www.cms.gov/medicare/payment/medicare-advantage-rates-statistics/risk-adjustment",
    retrievalDate: "May 23, 2026",
    note: "Verified CMS source for risk adjustment model files, ICD-10 mappings, and CMS-HCC mechanics. Dollar conversion remains modeled."
  },
  emblemOigAudit: {
    id: "emblemOigAudit",
    label: "EmblemHealth OIG audit, 362 of 1,222 sampled HCCs not validated",
    intendedSource: "HHS OIG Medicare Advantage audit of EmblemHealth contract H3330",
    url: "https://oig.hhs.gov/reports/all/2024/medicare-advantage-compliance-audit-of-diagnosis-codes-that-emblemhealth-contract-h3330-submitted-to-cms/",
    retrievalDate: "May 23, 2026",
    note: "Verified OIG worked example. OIG reported 362 unvalidated HCCs and 860 validated HCCs, roughly 30 percent unvalidated in the sample, plus an estimated $130 million in net overpayments for 2015."
  },
  medpacCodingIntensity: {
    id: "medpacCodingIntensity",
    label: "MedPAC analysis of MA coding intensity",
    intendedSource: "MedPAC report sections on Medicare Advantage coding intensity",
    url: "https://www.medpac.gov/document/chapter-13-estimating-medicare-advantage-coding-intensity-and-favorable-selection-march-2024-report/",
    retrievalDate: "May 23, 2026",
    note: "Supports the direction of coding-intensity risk, not a precise practice-level forecast."
  },
  employerPepm: {
    id: "employerPepm",
    label: "Employer direct contract modeled at $15 PEPM",
    intendedSource: "KFF employer benefits survey plus simulator assumption",
    url: "https://www.kff.org/health-costs/2025-employer-health-benefits-survey/",
    retrievalDate: "May 23, 2026",
    note: "Modeled assumption. KFF verifies that employers use virtual and direct primary care contracts; the $15 PEPM value is a scenario input, not a KFF benchmark."
  },
  chronicPrevalence: {
    id: "chronicPrevalence",
    label: "Chronic disease diagnosis defaults",
    intendedSource: "CDC/NCHS and NIMH prevalence references",
    url: "https://www.cdc.gov/nchs/products/databriefs/db511.htm",
    retrievalDate: "May 23, 2026",
    note: "Partly verified. HTN 30 percent is below CDC's adult hypertension estimate and is plausible for a mixed panel; diabetes 15 percent is above CDC's total diabetes population estimate and is a higher-risk panel assumption; heart failure 8 percent and MDD 12 percent are panel assumptions, not national adult prevalence values."
  },
  benchmarkArchetypes: {
    id: "benchmarkArchetypes",
    label: "Industry archetype contract mixes",
    intendedSource: "Editorial archetypes informed by CMS program structure, KFF employer benefits survey, and market-observed payer mixes",
    url: "https://data.cms.gov/medicare-shared-savings-program",
    retrievalDate: "May 23, 2026",
    note: "Not verified as industry averages. These are labeled as archetypes so readers do not mistake them for measured market benchmarks."
  },
  modelIndexes: {
    id: "modelIndexes",
    label: "Audit risk and patient outcomes indexes",
    intendedSource: "Simulator scoring model, OIG audit evidence, CMS quality measurement logic, and editorial assumptions",
    url: "https://oig.hhs.gov/reports/all/2024/medicare-advantage-compliance-audit-of-diagnosis-codes-that-emblemhealth-contract-h3330-submitted-to-cms/",
    retrievalDate: "May 23, 2026",
    note: "Modeled index. Values are directional 0 to 100 scores, not measured probabilities, observed outcomes, or CMS quality scores."
  }
};

export const allClaimRefs = Object.values(claimRefs);
