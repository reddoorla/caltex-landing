import { test, expect } from "@playwright/test";

// Ported from vineyard-custom-homes' tests/smoke/prismic-toolbar.spec.ts.
test("ending a preview leaves /preview and keeps the scroll position", async ({
  page,
  context,
  baseURL,
}) => {
  // @prismicio/svelte 2.x ends a preview with goto({ invalidateAll, noScroll }),
  // which kit 3 rejects in dev and ignores in production: the page jumps to the
  // top. reddoor-starter#188.
  await context.addCookies([{ name: "io.prismic.preview", value: "{}", url: baseURL! }]);
  await page.goto("/preview/our-story", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 400));
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(0);
  // The listener attaches on mount; retry the event until the navigation happens.
  await expect(async () => {
    await page.evaluate(() =>
      window.dispatchEvent(new Event("prismicPreviewEnd", { cancelable: true })),
    );
    await expect(page).toHaveURL((url) => url.pathname === "/our-story", { timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(before);
});
