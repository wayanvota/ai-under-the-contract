import { renderToStream } from "@react-pdf/renderer";
import { ScenarioPdf } from "@/components/ScenarioPdf";
import { isValidScenario, readBoundedJson, safeShareLabel } from "@/lib/requestValidation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await readBoundedJson(request);
  } catch (response) {
    if (response instanceof Response) return response;
    return Response.json({ error: "Request body could not be read." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "PDF request is invalid." }, { status: 400 });
  }
  const candidate = body as { scenario?: unknown; shareUrl?: unknown };
  const shareUrl = safeShareLabel(candidate.shareUrl);
  if (!isValidScenario(candidate.scenario) || !shareUrl) {
    return Response.json({ error: "PDF request is invalid." }, { status: 400 });
  }
  const stream = await renderToStream(<ScenarioPdf scenario={candidate.scenario} shareUrl={shareUrl} />);

  return new Response(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=ai-under-the-contract-scenario.pdf"
    }
  });
}
