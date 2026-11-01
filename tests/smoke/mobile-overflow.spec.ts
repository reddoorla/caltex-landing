import { test, expect, type Page } from "@playwright/test";

// No page may be wider than a phone or a tablet, and no text a visitor can see
// may run past the right edge. Ported from medical-solutions-of-texas
// tests/smoke/mobile-overflow.spec.ts (reddoorla/medical-solutions-of-texas#100)
// for P1-90 (reddoorla/reddoor-maintenance#1876). On 2026-11-01 the page title
// h1 (64px Impact, "GRANTS & COMMUNITY") reached 442px on a 320px screen, and
// the icon grid's labels were squeezed to about 22px beside a 128px icon at
// 320px and ran past the edge.
//
// A plain desktop context at the device width, because Chromium's mobile
// emulation zooms the page out to fit and hides the overflow. Two changes from
// MSOT's check, both from the census: only text that straddles the edge counts
// (text wholly past it is a closed menu or a carousel slide parked off-screen,
// not a cut), and text the browser does not paint (hidden, or opacity 0) is
// skipped.
const ROUTES = ["/", "/aed-programs", "/community", "/contact", "/our-story"];
const WIDTHS = [320, 390, 768, 820, 1024];

async function gotoLoaded(page: Page, path: string) {
  await page.goto(path, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
}

function measure(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const cut: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent?.trim()) continue;
      const el = n.parentElement;
      if (el && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const past = [...range.getClientRects()].filter((r) => r.width > 0 && r.right > vw + 1);
      if (past.some((r) => r.left < vw - 1)) {
        cut.push(`<${el?.tagName.toLowerCase()}> "${n.textContent.trim().slice(0, 60)}"`);
      }
    }
    return { scrollWidth: document.documentElement.scrollWidth, clientWidth: vw, cut };
  });
}

for (const width of WIDTHS) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const path of ROUTES) {
      test(`${path} has no horizontal overflow`, async ({ page }) => {
        await gotoLoaded(page, path);
        const { scrollWidth, clientWidth, cut } = await measure(page);
        expect(scrollWidth, `page is wider than ${clientWidth}px`).toBeLessThanOrEqual(clientWidth);
        expect(cut, `text cut off at the ${clientWidth}px edge`).toEqual([]);
      });
    }
  });
}
