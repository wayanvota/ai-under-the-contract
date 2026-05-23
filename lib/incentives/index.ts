import type { ScenarioInput, ScenarioResult } from "@/lib/types";
import { buildEmployer } from "./employer";
import { buildFfs } from "./ffs";
import { buildMa } from "./ma";
import { buildMssp } from "./mssp";

export function calculateScenario(input: ScenarioInput): ScenarioResult {
  const ffs = buildFfs(input);
  const mssp = buildMssp(input);
  const ma = buildMa(input);
  const employer = buildEmployer(input);

  return {
    comparisons: {
      ffs: ffs.comparison,
      mssp: mssp.comparison,
      ma: ma.comparison,
      employer: employer.comparison
    },
    projections: [ffs.projection, mssp.projection, ma.projection, employer.projection]
  };
}
