import { test, expect } from "@playwright/test";
import { smokeRoutes } from "./routes";

// /health declares `forms.none: true` (this site ships no form), and the fleet's
// nightly form-e2e records the site n/a on that word. The declaration is only
// true while no page renders a form, so this pins both halves together: a PR
// that puts a form on a smoke route (tests/smoke/routes.ts) fails here until it
// removes `none` from /health. A form on any other Prismic page is not seen
// here, nor by the nightly (which looks at /contact and / only).
test("/health declares no form, and no smoke route renders one", async ({ page, request }) => {
  const res = await request.get("/health");
  expect(res.ok()).toBe(true);
  const { forms } = (await res.json()) as { forms: { testMode?: unknown; none?: unknown } };
  expect(forms.none).toBe(true);
  expect(forms.testMode).toBe(false);

  for (const route of smokeRoutes) {
    const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), route.path).toBe(route.expectStatus ?? 200);
    expect(await page.locator("form").count(), `${route.path} renders a <form>`).toBe(0);
  }
});
