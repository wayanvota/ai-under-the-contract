"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Download, ExternalLink, Link2, Save, SlidersHorizontal, X } from "lucide-react";
import { benchmarkScenarios, contractColors, contractLabels, contractOrder } from "@/lib/defaults";
import { calculateScenario } from "@/lib/incentives";
import { dollars, diagnosisTotal } from "@/lib/incentives/shared";
import { allClaimRefs, claimRefs } from "@/lib/sources/claims";
import type { ClaimRef, ContractKey, DiagnosisDistribution, ScenarioInput, StoredScenario } from "@/lib/types";

type SimulatorProps = {
  initialScenario: ScenarioInput | StoredScenario;
  sharedSlug?: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";

const contractTooltips = {
  ffs: "FFS pays for billable visits and services.",
  mssp: "MSSP is Medicare's accountable-care shared-savings program.",
  ma: "HCC and RAF are Medicare Advantage risk-adjustment inputs.",
  employer: "PEPM means per employee per month."
} satisfies Record<ContractKey, string>;

function normalizeScenario(input: ScenarioInput | StoredScenario): ScenarioInput {
  return {
    name: "name" in input ? input.name : "Shared scenario",
    contractMix: input.contractMix,
    panelSize: input.panelSize,
    diagnoses: input.diagnoses
  };
}

function rebalanceMix(current: ScenarioInput["contractMix"], changed: ContractKey, value: number) {
  const nextValue = Math.max(0, Math.min(100, Math.round(value)));
  const remaining = Math.max(0, 100 - nextValue);
  const others = contractOrder.filter((key) => key !== changed);
  const otherTotal = others.reduce((sum, key) => sum + current[key], 0);
  const next = { ...current, [changed]: nextValue };

  if (otherTotal === 0) {
    const even = Math.floor(remaining / others.length);
    others.forEach((key, index) => {
      next[key] = index === others.length - 1 ? remaining - even * (others.length - 1) : even;
    });
    return next;
  }

  let assigned = 0;
  others.forEach((key, index) => {
    const adjusted = index === others.length - 1 ? remaining - assigned : Math.round((current[key] / otherTotal) * remaining);
    next[key] = adjusted;
    assigned += adjusted;
  });

  return next;
}

function buildChartData(result: ReturnType<typeof calculateScenario>, metric: "revenue" | "auditRisk" | "outcomesIndex") {
  return ["Year 1", "Year 2", "Year 3"].map((year, index) => {
    const row: Record<string, string | number> = { year };
    result.projections.forEach((projection) => {
      row[projection.contract] = projection.points[index][metric];
    });
    return row;
  });
}

export default function Simulator({ initialScenario, sharedSlug }: SimulatorProps) {
  const [scenario, setScenario] = useState<ScenarioInput>(() => normalizeScenario(initialScenario));
  const [benchmarkOpen, setBenchmarkOpen] = useState(false);
  const [activeSources, setActiveSources] = useState<ClaimRef[] | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [shareUrl, setShareUrl] = useState(sharedSlug ? `/s/${sharedSlug}` : "");
  const [error, setError] = useState("");

  const result = useMemo(() => calculateScenario(scenario), [scenario]);
  const diagnosisSum = diagnosisTotal(scenario.diagnoses);
  const validDiagnoses = diagnosisSum <= 100;
  const fullShareUrl = shareUrl;

  function updateDiagnosis(key: keyof DiagnosisDistribution, value: number) {
    setScenario((current) => ({
      ...current,
      diagnoses: {
        ...current.diagnoses,
        [key]: Math.max(0, Math.min(100, Math.round(value)))
      }
    }));
  }

  async function saveScenario() {
    if (!validDiagnoses) {
      setError("Diagnosis percentages must total 100 percent or less.");
      return;
    }

    setSaveState("saving");
    setError("");

    const response = await fetch("/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scenario)
    });

    if (!response.ok) {
      setSaveState("error");
      setError("Scenario could not be saved. Check the database connection or local development store.");
      return;
    }

    const payload = (await response.json()) as { url: string };
    setShareUrl(payload.url);
    setSaveState("saved");
  }

  async function exportPdf() {
    const response = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario, shareUrl: fullShareUrl || "Unsaved scenario" })
    });

    if (!response.ok) {
      setError("PDF export failed.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ai-under-the-contract-scenario.pdf";
    link.click();
    URL.revokeObjectURL(url);
  }

  function showSources(ids: string[]) {
    setActiveSources(ids.map((id) => claimRefs[id]).filter(Boolean));
  }

  return (
    <main className="min-h-screen bg-page">
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 lg:grid-cols-[1fr_420px] lg:px-6">
          <div className="flex flex-col justify-between gap-4">
            <div>
              <nav className="mb-5 flex flex-wrap gap-2 text-sm font-semibold text-slate-600" aria-label="Tool navigation">
                <a className="rounded-md border border-line bg-white px-3 py-2 hover:bg-slate-100" href="https://wayan.com/ai-healthcare-contract/">
                  Home
                </a>
                <a className="rounded-md border border-line bg-white px-3 py-2 hover:bg-slate-100" href="https://wayan.com/ai-healthcare-contract/about.html">
                  About
                </a>
                <a className="rounded-md border border-ink bg-ink px-3 py-2 text-white hover:bg-slate-700" href="https://payer-contract-sim.onrender.com/">
                  Simulator
                </a>
              </nav>
              <h1 className="max-w-4xl text-3xl font-semibold leading-tight tracking-normal text-ink sm:text-4xl">
                Your AI documentation copilot is not neutral.
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg">
                It optimizes what your contracts pay for. Move the inputs to see what that means for your panel.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
              <Metric label="Panel size" value={scenario.panelSize.toLocaleString()} />
              <Metric label="Diagnosis share" value={`${diagnosisSum}%`} tone={validDiagnoses ? "neutral" : "danger"} />
              <Metric label="Other or acute only" value={`${Math.max(0, 100 - diagnosisSum)}%`} />
            </div>
          </div>

          <div className="rounded-lg border border-line bg-slate-50 p-3 shadow-panel">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <SlidersHorizontal className="h-4 w-4" />
              Scenario inputs
            </div>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {contractOrder.map((key) => (
                  <SliderRow
                    key={key}
                    label={contractLabels[key]}
                    help={contractTooltips[key]}
                    color={contractColors[key]}
                    value={scenario.contractMix[key]}
                    onChange={(value) =>
                      setScenario((current) => ({
                        ...current,
                        contractMix: rebalanceMix(current.contractMix, key, value)
                      }))
                    }
                  />
                ))}
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-normal text-slate-500">Attributed lives</span>
                <input
                  className="mt-1 w-full rounded-md border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-slate-500"
                  type="number"
                  min={1}
                  value={scenario.panelSize}
                  onChange={(event) =>
                    setScenario((current) => ({ ...current, panelSize: Math.max(1, Number(event.target.value)) }))
                  }
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <NumberField label="HTN %" value={scenario.diagnoses.hypertension} onChange={(value) => updateDiagnosis("hypertension", value)} />
                <NumberField label="T2DM %" value={scenario.diagnoses.diabetes} onChange={(value) => updateDiagnosis("diabetes", value)} />
                <NumberField label="HF %" value={scenario.diagnoses.heartFailure} onChange={(value) => updateDiagnosis("heartFailure", value)} />
                <NumberField label="MDD %" value={scenario.diagnoses.depression} onChange={(value) => updateDiagnosis("depression", value)} />
              </div>

              {!validDiagnoses && <p className="text-sm font-medium text-red-700">Diagnosis percentages must total 100 percent or less.</p>}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                  onClick={saveScenario}
                  disabled={saveState === "saving"}
                >
                  <Save className="h-4 w-4" />
                  {saveState === "saving" ? "Saving" : "Save scenario"}
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-slate-100"
                  onClick={exportPdf}
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-slate-100"
                  onClick={() => setBenchmarkOpen((current) => !current)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Industry benchmark
                </button>
              </div>

              {fullShareUrl && (
                <div className="rounded-md border border-line bg-white p-3 text-sm">
                  <div className="mb-1 flex items-center gap-2 font-semibold text-ink">
                    <Link2 className="h-4 w-4" />
                    Share URL
                  </div>
                  <a className="break-all text-slate-700 underline" href={shareUrl}>
                    {fullShareUrl}
                  </a>
                </div>
              )}
              {error && <p className="text-sm font-medium text-red-700">{error}</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 lg:px-6">
        <ModelDisclosure onOpenSources={() => setActiveSources(allClaimRefs)} />
        <div className="grid gap-4 lg:grid-cols-4">
          {contractOrder.map((key) => {
            const block = result.comparisons[key];
            return (
              <article key={key} className="flex min-h-full flex-col rounded-lg border border-line bg-white shadow-sm">
                <div className="border-b border-line p-4" style={{ borderTop: `5px solid ${block.color}` }}>
                  <h2 className="text-lg font-semibold leading-tight text-ink">{block.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">{contractTooltips[key]}</p>
                </div>
                <ComparisonSection title="What the AI surfaces">
                  <ul className="space-y-2">
                    {block.aiSurfaces.map((item) => (
                      <li key={item} className="text-sm leading-5 text-slate-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </ComparisonSection>
                <ComparisonSection title="What that drives">{block.drives}</ComparisonSection>
                <ComparisonSection title="Revenue and risk">{block.revenueRisk}</ComparisonSection>
                <ComparisonSection title="Patient consequence">{block.patientConsequence}</ComparisonSection>
                <div className="mt-auto border-t border-line p-4">
                  <button className="text-sm font-semibold text-ink underline" onClick={() => showSources(block.claimIds)}>
                    Sources for this logic
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-6 text-center text-lg font-semibold text-ink">
          Same AI. Same panel. Same diagnoses. Four different companies you become.
        </p>
      </section>

      {benchmarkOpen && (
        <section className="mx-auto max-w-7xl px-4 pb-6 lg:px-6">
          <div className="rounded-lg border border-line bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">Industry benchmark overlay</h2>
              <button className="text-sm font-semibold text-slate-600 underline" onClick={() => showSources(["chronicPrevalence"])}>
                Benchmark sources
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {benchmarkScenarios.map((benchmark) => (
                <div key={benchmark.name} className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 opacity-80">
                  <h3 className="text-sm font-semibold text-ink">{benchmark.name}</h3>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-slate-600">
                    {contractOrder.map((key) => (
                      <div key={key}>
                        <div className="h-2 rounded" style={{ backgroundColor: contractColors[key], width: `${benchmark.contractMix[key]}%`, minWidth: 12 }} />
                        <div className="mt-1 font-semibold">{benchmark.contractMix[key]}%</div>
                        <div>{contractLabels[key]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-8 lg:px-6">
        <div className="rounded-lg border border-line bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-ink">Three-year projection</h2>
              <p className="mt-1 text-sm text-slate-600">
                The Year 1 choice compounds into a different operating model by Year 3. Dollar figures and audit-risk scores are modeled estimates.
              </p>
            </div>
            <button className="text-sm font-semibold text-ink underline" onClick={() => setActiveSources(allClaimRefs)}>
              Open source notes and methodology
            </button>
          </div>
          <div className="chart-scroll grid gap-4 overflow-x-auto lg:grid-cols-3">
            <ChartCard title="Revenue trajectory" data={buildChartData(result, "revenue")} money />
            <ChartCard title="Audit risk" data={buildChartData(result, "auditRisk")} />
            <ChartCard title="Patient outcomes index" data={buildChartData(result, "outcomesIndex")} area />
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm leading-6 text-slate-600 lg:px-6">
          Built by Wayan Vota at <a className="font-semibold underline" href="https://wayan.com/">wayan.com</a>. Visit the{" "}
          <a className="font-semibold underline" href="https://wayan.com/ai-healthcare-contract/">home page</a> or{" "}
          <a className="font-semibold underline" href="https://wayan.com/ai-healthcare-contract/about.html">about page</a>. The dashboard you build is the dashboard you optimize. The dashboard you optimize is the company you become.
        </div>
      </footer>

      {activeSources && <SourcesModal sources={activeSources} onClose={() => setActiveSources(null)} />}
    </main>
  );
}

function Metric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "danger" }) {
  return (
    <div className="rounded-lg border border-line bg-slate-50 p-3">
      <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${tone === "danger" ? "text-red-700" : "text-ink"}`}>{value}</div>
    </div>
  );
}

function SliderRow({
  label,
  help,
  value,
  color,
  onChange
}: {
  label: string;
  help: string;
  value: number;
  color: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3">
        <span>
          <span className="text-sm font-semibold text-ink">{label}</span>
          <span className="ml-2 text-xs text-slate-500" title={help}>
            ?
          </span>
        </span>
        <span className="text-sm font-semibold text-ink">{value}%</span>
      </span>
      <input
        className="mt-1 h-2 w-full accent-current"
        style={{ color }}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-normal text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-slate-500"
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function ComparisonSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-normal text-slate-500">{title}</h3>
      <div className="text-sm leading-6 text-slate-700">{children}</div>
    </div>
  );
}

function ModelDisclosure({ onOpenSources }: { onOpenSources: () => void }) {
  return (
    <div className="mb-4 rounded-lg border border-line bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
      <span className="font-semibold text-ink">Modeled estimates: </span>
      Dollar figures and audit-risk scores are scaled to your inputs. They are not verified CMS values unless the source note says so.{" "}
      <button className="font-semibold text-ink underline" onClick={onOpenSources}>
        See source notes and methodology.
      </button>
    </div>
  );
}

function ChartCard({ title, data, money = false, area = false }: { title: string; data: Record<string, string | number>[]; money?: boolean; area?: boolean }) {
  return (
    <div className="min-w-[320px] rounded-lg border border-line bg-slate-50 p-3">
      <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {area ? (
            <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#d8dee8" strokeDasharray="4 4" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => (money ? `$${Math.round(value / 1000)}K` : `${value}`)} width={52} />
              <Tooltip formatter={(value: number) => (money ? dollars(value) : value)} />
              {contractOrder.map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={contractLabels[key]}
                  stroke={contractColors[key]}
                  fill={contractColors[key]}
                  fillOpacity={0.12}
                  strokeWidth={2.4}
                  dot={{ r: 3 }}
                />
              ))}
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#d8dee8" strokeDasharray="4 4" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => (money ? `$${Math.round(value / 1000)}K` : `${value}`)} width={52} />
              <Tooltip formatter={(value: number) => (money ? dollars(value) : value)} />
              {contractOrder.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={contractLabels[key]}
                  stroke={contractColors[key]}
                  strokeWidth={2.4}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SourcesModal({ sources, onClose }: { sources: ClaimRef[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 p-4" role="dialog" aria-modal="true">
      <div className="mx-auto max-h-[90vh] max-w-3xl overflow-y-auto rounded-lg bg-white shadow-panel">
        <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-line bg-white p-4">
          <h2 className="text-lg font-semibold text-ink">Source notes</h2>
          <button className="rounded-md border border-line p-2 text-ink hover:bg-slate-100" onClick={onClose} aria-label="Close sources">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="divide-y divide-line">
          {sources.map((source) => (
            <div key={source.id} className="p-4">
              <h3 className="text-sm font-semibold text-ink">{source.label}</h3>
              <p className="mt-2 text-sm text-slate-700">
                <span className="font-semibold">Intended primary source: </span>
                {source.intendedSource}
              </p>
              <p className="mt-1 break-all text-sm text-slate-700">
                <span className="font-semibold">URL: </span>
                {source.url}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-semibold">Retrieval date: </span>
                {source.retrievalDate}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-semibold">Defensibility note: </span>
                {source.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
