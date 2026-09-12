import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT || 3107);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["line"], ["html", { outputFolder: "playwright-report", open: "never" }]] : "line",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
        }
      }
    }
  ],
  webServer: {
    command: `npm run start -- -p ${port}`,
    url: baseURL,
    timeout: 60_000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: "",
      LOCAL_SCENARIO_STORE_FILE: "e2e-scenarios.json"
    }
  }
});
