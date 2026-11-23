import { defineConfig } from "@playwright/test";

const url = "http://localhost:{{DEV_PORT}}";

export default defineConfig({
  testDir: "e2e",
  use: { baseURL: url },
  webServer: { command: "npm run dev", url, reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
