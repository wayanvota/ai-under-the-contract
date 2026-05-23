import { renderToStream } from "@react-pdf/renderer";
import { ScenarioPdf } from "@/components/ScenarioPdf";
import type { ScenarioInput } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { scenario: ScenarioInput; shareUrl: string };
  const stream = await renderToStream(<ScenarioPdf scenario={body.scenario} shareUrl={body.shareUrl} />);

  return new Response(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=ai-under-the-contract-scenario.pdf"
    }
  });
}
