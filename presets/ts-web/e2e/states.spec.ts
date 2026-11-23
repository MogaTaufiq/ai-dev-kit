import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [320, 768, 1024, 1440]) {
  test(`/states at ${width}px has no axe violations`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/states");
    await page.screenshot({ path: `test-results/states-${width}.png`, fullPage: true });
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations).toEqual([]);
  });
}
