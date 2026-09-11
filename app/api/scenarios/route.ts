import { NextResponse } from "next/server";
import { isValidScenario, readBoundedJson } from "@/lib/requestValidation";
import { saveScenario } from "@/lib/scenarioStore";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await readBoundedJson(request);
  } catch (response) {
    if (response instanceof Response) return response;
    return NextResponse.json({ error: "Request body could not be read." }, { status: 400 });
  }

  if (!isValidScenario(body)) {
    return NextResponse.json({ error: "Scenario inputs are out of range." }, { status: 400 });
  }

  const slug = await saveScenario(body);
  return NextResponse.json({ slug, url: `/s/${slug}` });
}
