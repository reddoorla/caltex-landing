import { test, expect, type Page } from "@playwright/test";

const label = '[data-slice-type="icon_grid"] h3';

const measure = (page: Page, text: string) =>
  page
    .locator(label)
    .first()
    .evaluate((h, text) => {
      h.textContent = text;
      const range = document.createRange();
      range.selectNodeContents(h);
      return {
        height: h.getBoundingClientRect().height,
        width: range.getBoundingClientRect().width,
      };
    }, text);

test.describe("icon grid labels", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/aed-programs", { waitUntil: "domcontentloaded" });
    await expect(page.locator(label).first()).toBeVisible();
  });

  test("a newline in a label is a line break", async ({ page }) => {
    const oneLine = await measure(page, "No commitment, 12 terms.");
    const twoLines = await measure(page, "No commitment,\n12 terms.");
    expect(twoLines.height).toBeGreaterThan(oneLine.height * 1.5);
  });

  test("runs of spaces still collapse to one", async ({ page }) => {
    const single = await measure(page, "Battery and electrode");
    const double = await measure(page, "Battery and    electrode");
    expect(double.width).toBeCloseTo(single.width, 0);
  });
});
