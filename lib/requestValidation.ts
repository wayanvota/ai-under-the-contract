import type { ScenarioInput } from "@/lib/types";

const MAX_JSON_CHARS = 64 * 1024;

function validPercent(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}
export function isValidScenario(value: unknown): value is ScenarioInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const body = value as Partial<ScenarioInput>;
  const mix = body.contractMix;
  const diagnoses = body.diagnoses;
  if (!mix || !diagnoses || !Number.isSafeInteger(body.panelSize) || Number(body.panelSize) < 1) {
    return false;
  }
  if (body.name !== undefined && (typeof body.name !== "string" || body.name.length > 200)) {
    return false;
  }
  const mixValues = [mix.ffs, mix.mssp, mix.ma, mix.employer];
  const diagnosisValues = [diagnoses.hypertension, diagnoses.diabetes, diagnoses.heartFailure, diagnoses.depression];
  const mixSum = mixValues.reduce((sum, item) => sum + Number(item), 0);
  const diagnosisSum = diagnosisValues.reduce((sum, item) => sum + Number(item), 0);
  return (
    Math.abs(mixSum - 100) <= 0.5 &&
    diagnosisSum <= 100 &&
    mixValues.every(validPercent) &&
    diagnosisValues.every(validPercent)
  );
}

export async function readBoundedJson(request: Request): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_JSON_CHARS) {
    throw new Response(JSON.stringify({ error: "Request body is too large." }), {
      status: 413,
      headers: { "Content-Type": "application/json" }
    });
  }
  const raw = await request.text();
  if (raw.length > MAX_JSON_CHARS) {
    throw new Response(JSON.stringify({ error: "Request body is too large." }), {
      status: 413,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Response(JSON.stringify({ error: "Request body must be valid JSON." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export function safeShareLabel(value: unknown) {
  if (value === "Unsaved scenario") return value;
  if (typeof value !== "string" || value.length > 2048) return null;
  if (/^\/s\/[0-9A-Za-z]{8}$/.test(value)) return value;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
