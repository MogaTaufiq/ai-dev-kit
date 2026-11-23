import { test, expect } from "@playwright/test";

const url = process.env.SMOKE_URL;
if (!url) throw new Error("SMOKE_URL is not set: point it at the deployed site before running the smoke test");

test("deployed site serves the home page", async ({ page }) => {
  const response = await page.goto(url);
  expect(response?.ok()).toBe(true);
  await page.screenshot({ path: "test-results/smoke-home.png", fullPage: true });
});
