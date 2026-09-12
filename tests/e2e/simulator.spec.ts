import { expect, test, type Page } from "@playwright/test";
import { promises as fs } from "node:fs";
import path from "node:path";

const storePath = path.join(process.cwd(), ".data", "e2e-scenarios.json");

const validScenario = {
  name: "E2E scenario",
  contractMix: { ffs: 40, mssp: 25, ma: 20, employer: 15 },
  panelSize: 10000,
  diagnoses: { hypertension: 30, diabetes: 15, heartFailure: 8, depression: 12 }
};

test.beforeEach(async () => {
  await fs.rm(storePath, { force: true });
});

async function saveScenario(page: Page) {
  await page.getByRole("button", { name: "Save scenario" }).click();
  const link = page.locator('a[href^="/s/"]');
  await expect(link).toBeVisible();
  return link.getAttribute("href");
}

test("U01 first use exposes the simulator and its decision boundary", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Your AI documentation copilot/i })).toBeVisible();
  await expect(page.getByText("Modeled estimates:").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Save scenario" })).toBeVisible();
});

test("U02 changing the contract mix rebalances to 100 percent", async ({ page }) => {
  await page.goto("/");
  const sliders = page.getByRole("slider");
  await sliders.nth(0).fill("70");
  const values = await sliders.evaluateAll((items) => items.map((item) => Number((item as HTMLInputElement).value)));
  expect(values.reduce((sum, value) => sum + value, 0)).toBe(100);
  await expect(page.getByText("70%").first()).toBeVisible();
});

test("U03 invalid diagnosis totals explain the error and recover", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("HTN %").fill("100");
  await expect(page.getByText("Diagnosis percentages must total 100 percent or less.").first()).toBeVisible();
  await page.getByRole("button", { name: "Save scenario" }).click();
  await expect(page.getByText("Diagnosis percentages must total 100 percent or less.").last()).toBeVisible();
  await page.getByLabel("HTN %").fill("30");
  await saveScenario(page);
});

test("U04 valid zero and minimum panel values are preserved", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Attributed lives").fill("0");
  await expect(page.getByLabel("Attributed lives")).toHaveValue("1");
  await page.getByLabel("HF %").fill("0");
  await expect(page.getByLabel("HF %")).toHaveValue("0");
});

test("U05 saved scenario survives deep link and reload", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Attributed lives").fill("12345");
  const href = await saveScenario(page);
  expect(href).toMatch(/^\/s\/[0-9A-Za-z]{8}$/);
  await page.goto(href!);
  await expect(page.getByText("12,345").first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("12,345").first()).toBeVisible();
});

test("U06 archetype and source dialogs open and close", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Industry archetype" }).click();
  await expect(page.getByRole("heading", { name: "Industry archetype overlay" })).toBeVisible();
  await page.getByRole("button", { name: /See source links and methodology/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close sources" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("U07 save failure is visible and retry succeeds", async ({ page }) => {
  await page.route("**/api/scenarios", (route) => route.fulfill({ status: 503, body: "unavailable" }));
  await page.goto("/");
  await page.getByRole("button", { name: "Save scenario" }).click();
  await expect(page.getByText(/Scenario could not be saved/)).toBeVisible();
  await page.unroute("**/api/scenarios");
  await saveScenario(page);
});

test("U08 keyboard controls change inputs and open source notes", async ({ page }) => {
  await page.goto("/");
  const slider = page.getByRole("slider").first();
  await slider.focus();
  const before = Number(await slider.inputValue());
  await page.keyboard.press("ArrowRight");
  expect(Number(await slider.inputValue())).toBeGreaterThan(before);
  await page.getByRole("button", { name: /See source links and methodology/i }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("U09 mobile viewport retains the complete core controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Save scenario" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export PDF" })).toBeVisible();
  expect(await page.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth)).toBe(true);
});

test("U10 repeated save action does not create duplicate requests", async ({ page }) => {
  let requests = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/api/scenarios") && request.method() === "POST") requests += 1;
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Save scenario" }).dblclick();
  await expect(page.locator('a[href^="/s/"]')).toBeVisible();
  expect(requests).toBe(1);
});

test("A01 unknown shared slug returns a real 404", async ({ page }) => {
  const response = await page.goto("/s/NotReal1");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});

test("A02 type-confused scenario is rejected at the API boundary", async ({ request }) => {
  const response = await request.post("/api/scenarios", { data: { ...validScenario, panelSize: { value: 10 } } });
  expect(response.status()).toBe(400);
});

test("A03 stored markup cannot execute on a shared page", async ({ page, request }) => {
  const marker = '<img src=x onerror="window.__contractXss=1">';
  const response = await request.post("/api/scenarios", { data: { ...validScenario, name: marker } });
  expect(response.ok()).toBe(true);
  const { url } = await response.json();
  await page.goto(url);
  expect(await page.evaluate(() => (window as Window & { __contractXss?: number }).__contractXss)).toBeUndefined();
  await expect(page.locator("img[src=x]")).toHaveCount(0);
});

test("A04 interpreter-shaped text remains inert data", async ({ page, request }) => {
  const payload = "'; DROP TABLE scenarios; --";
  const response = await request.post("/api/scenarios", { data: { ...validScenario, name: payload } });
  expect(response.ok()).toBe(true);
  const { url } = await response.json();
  await page.goto(url);
  await expect(page.getByRole("heading", { name: /Your AI documentation copilot/i })).toBeVisible();
});

test("A05 cross-origin response does not grant browser access", async ({ request }) => {
  const response = await request.post("/api/scenarios", {
    headers: { Origin: "https://attacker.invalid" },
    data: validScenario
  });
  expect(response.headers()["access-control-allow-origin"]).toBeUndefined();
  expect(response.headers()["access-control-allow-credentials"]).toBeUndefined();
});

test("A06 encoded path traversal cannot select the local store", async ({ page }) => {
  const response = await page.goto("/s/%2e%2e%2f%2e%2e%2fsecret");
  expect(response?.status()).toBeGreaterThanOrEqual(400);
  await expect(page.getByRole("heading", { name: /Your AI documentation copilot/i })).toHaveCount(0);
});

test("A07 unsafe PDF share URL is rejected", async ({ request }) => {
  const response = await request.post("/api/pdf", {
    data: { scenario: validScenario, shareUrl: "javascript:alert(1)" }
  });
  expect(response.status()).toBe(400);
  expect(await response.text()).not.toContain("javascript:");
});

test("A08 caller-supplied slug is ignored and a safe slug is generated", async ({ request }) => {
  const response = await request.post("/api/scenarios", { data: { ...validScenario, slug: "../../owned" } });
  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body.slug).toMatch(/^[0-9A-Za-z]{8}$/);
  expect(body.url).toBe(`/s/${body.slug}`);
});

test("A09 oversized JSON is rejected without persistence", async ({ request }) => {
  const response = await request.post("/api/scenarios", {
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({ ...validScenario, padding: "x".repeat(70_000) })
  });
  expect(response.status()).toBe(413);
  await expect(fs.stat(storePath)).rejects.toThrow();
});

test("A10 malformed requests do not expose internals", async ({ request }) => {
  const response = await request.post("/api/pdf", {
    headers: { "Content-Type": "application/json" },
    data: "{not-json"
  });
  expect(response.status()).toBe(400);
  const body = await response.text();
  expect(body).not.toContain("DATABASE_URL");
  expect(body).not.toContain("Prisma");
  expect(body).not.toContain("stack");
});
