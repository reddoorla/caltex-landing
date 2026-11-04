# Caltex Medical — Work Journal

Running log of build work: what was done, why, and where it landed.
Chronological — newest entry at the bottom. The code says what the site does
now; this is the history of getting it there.

The convention is in [CLAUDE.md](../CLAUDE.md) under "The work journal". In
short: every working session appends a dated entry, prose over bullets, why
over what, and history is never edited to be right — a later entry corrects an
earlier one and says so.

---

## 2026-09-05 — Journal opened, and 138 commits of history summarised rather than reconstructed (`chore/work-journal`)

The journal starts today, so this first entry is a **backfill**: a deliberately
coarse summary written from the commit log, not from memory. Detail below this
line is trustworthy; detail above it is not, and nothing here should be cited
as though someone wrote it down at the time. For anything before 2026-09-05 the
commit log is the record.

**What this repo is.** The marketing site for Caltex Medical — AEDs, leasing
and program management for the San Antonio area and the Texas Hill Country.
SvelteKit 2 / Svelte 5 / Tailwind v4 / Prismic, deployed on Netlify at
`https://www.caltexmedical.com`. Five hand-built routes (home, community,
leasing, purchases, contact) plus a Prismic `[uid]` catch-all, four slices
(`Hero`, `ContentWidth`, `RichText`, `ThreeStepPlan`), and no form backend
anywhere: the "request info" modal is a `mailto:`/`tel:` card, and the dead
Netlify-Forms remnants were removed deliberately in #19.

**The eras.** 138 commits fall into two clearly separate lives. **2025-01
through 2025-09 (42 commits)** is the build and the client rounds — terse
messages ("first push for desktop", "markup", "client changes", "mobile
tweaks"), heaviest in January and February, then content and responsive passes
in July and August, then nothing for eight months. **2026-05 through 2026-09
(94 commits)** is almost entirely fleet maintenance rather than feature work:
pnpm, onboarding onto `@reddoorla/maintenance` and its synced configs, the
Svelte 4→5 and Tailwind 3→4 migration finished off (May alone is 46 commits —
see [UPGRADE_NOTES.md](UPGRADE_NOTES.md)), `adapter-auto` → `adapter-netlify`,
Node 24, the shared reusable CI workflow, Renovate auto-merge, and a purge of
19 unused components. Layered on top of that is a run of small correctness
fixes that are worth knowing happened: `og:image` (#28), `/health` (#29), a
smoke suite (#30), 404 instead of 500 for unknown pages (#31), a
Prismic-backed `sitemap.xml` (#34), an honest meta-description fallback (#37),
distinct per-page titles (#51), and capped Prismic srcset widths with a real
`sizes` on every image (#59).

**The one content defect in the log is worth pulling forward.** `4a80b2a`
corrects the client's own name — "Ryan Kohen" → "Ryan Kohnen" — which had been
hand-copied wrong across five files. That is why `src/lib/constants/contact.ts`
exists and why contact details are imported from it rather than typed again.

**State as of this entry.** `main` at `a1b7315`, tree clean, nothing in flight
and no work in progress on any local branch. Last substantive change was
2026-09-01.

## 2026-10-04 — Off Slice Machine, onto the Prismic CLI (reddoor-maintenance#1090, `claude/prismic-cli`)

Phase 4 of the fleet migration (reddoor-maintenance
`docs/prismic-migration-plan-2026-10.md` §9), following espada's port
(espada#79) of reddoor-starter#166. Slice Machine is deprecated by Prismic
since 2026-09-18; models are now edited in the Type Builder and the generated
files come from `pnpm prismic:gen`.

**The simulator could not be framed, and the reason was prerendering, not a
policy.** This site never opted into the central CSP and has no hook, so on
paper nothing restricted framing. But the root layout's `prerender = "auto"`
let the build crawl `/slice-simulator` into a static file, and netlify.toml's
`/*` block sends `X-Frame-Options: SAMEORIGIN` on static files. Measured on
www.caltexmedical.com before the change: `/slice-simulator`, `/`, `/leasing`
and `/contact` all carried `SAMEORIGIN` from the edge cache, while `/health`
(a function, `prerender = false`) carried none. That control is the evidence
that Netlify's static headers do not reach a server-rendered response. So
`/slice-simulator` is now `prerender = false`, and `src/hooks.server.ts`, which
touches only that route, drops X-Frame-Options and sends
`frame-ancestors 'self' http://localhost:* https://*.prismic.io https://prismic.io`.
From `vite preview`, that header is the only change: `/`, `/leasing`, `/health`
and a 404 uid send neither header, before and after. The prerendered set went
from six pages to five. Putting `prerender` back to `"auto"` returns
`slice-simulator.html` to the build output.

**Types moved to the project root, and svelte-check stopped seeing them.**
Nothing here imported the old `src/prismicio-types.d.ts` by path, so moving it
outside SvelteKit's `src/**` include took `Content.*` from all four slices and
the typed uid from `[uid]`'s `entries()`: 0 errors before, 5 after. The
`src/app.d.ts` import brings it back to 0; deleting that line returns the same 5.

**No stale model.** The regenerated types export the same 31 names as the
Slice Machine file, and the slice index maps the same four components. The
code differs only in generator output: heading-only rich text is typed
`RichTextField`, not `TitleField`, and every `LinkField` spells out its
generics. The `prismic-codegen` job passed on the committed tree and went red
with an un-regenerated field added to the RichText model.

The nightly drift sweep read caltex's 6 models as matching Prismic at
`1816abf`, the base of this change, so nothing was owed to Prismic first.

## 2026-10-04 — The simulator leaves every page's bundle; an encoded path gets the simulator's framing (#70)

These are the two findings from the adversarial review of #69, ported from reddoor-starter#168, where the reasoning and the fixes that failed are recorded. #69 imported `SliceSimulator` from the `@prismicio/svelte` barrel. The barrel statically re-exports it, so Rolldown put `@prismicio/simulator` into the barrel's shared chunk. Here that chunk hung off the root layout, so every page preloaded it. `scripts/prismic-barrel.ts` declares that one re-export-only module side-effect-free, and Rolldown then binds `SliceZone` directly.

Measured from the build manifest as each node's static-import closure, gzipped, before → after. The root layout, which every page loads, went 52,489 → 45,229. Home went 33,304 → 26,048, `/leasing` 35,526 → 28,270, `/purchases` 34,368 → 27,114, `/contact` 33,758 → 29,330, `/community` 33,293 → 28,868 and `[uid]` 32,422 → 28,368. Before, every one of them reached the simulator chunk. After, only `/slice-simulator` does, and it carries the code in its own node. That is more than #69 added (+3.3 KB on `index.html`), because the shared chunk had also been carrying other barrel exports that no page used.

The hook asked `isCmsFramedRoute(event.url.pathname)`, which is the raw path, while SvelteKit routes on the decoded one. So `/slice%2Dsimulator` rendered the simulator with no framing header at all. That was inert, since `@prismicio/simulator` checks message origins, but it was still wrong. The hook now asks `event.route.id`. From `vite preview` before the change, `/slice%2Dsimulator` and `/slice%2dsimulator` returned 200 with no X-Frame-Options and no CSP. After, both return the widened `frame-ancestors`, the same as `/slice-simulator`.

The plugin file is TypeScript, identical to the starter's, and is imported from `vite.config.js` without an extension. `svelte-check` runs `checkJs` here and refuses both a `.ts` extension in the import and a JS copy of the plugin (`this.error` has no type there). This site has no unit tests, so the proof is `tests/smoke/slice-simulator.spec.ts`. It reads the build manifest from disk, because CI's smoke suite serves `vite dev`, where no chunks exist, and it reads the framing headers over HTTP. On `main` it failed 3 of 7: the bundle check and both encoded paths. On this branch it passes 7 of 7. With the plugin removed it fails the bundle check. The first version read modulepreload links over HTTP and passed on `main`: its regex expected `rel` before `href`, and this site writes them the other way round. A check that only ever passed would have been reported as proof.

## 2026-10-05 — AED Leasing becomes AED Programs, AED Purchases becomes Our Story (#71)

Erik's ask from #caltex. Both names were hard-coded, not Prismic content: the
nav, the h1s and the `<title>`s of the two static routes. The routes moved to
`/aed-programs` and `/our-story`, so the URL says what the page is. All four
old paths (`/leasing`, `/purchases` and their `/preview/` twins) answer 301
from `netlify.toml`. That was measured on the deploy preview, because a
review argued from Netlify's docs that the `/*` function would shadow the
redirects. It does not. The `/preview/` pair was the review's real catch:
they are prerendered 200s on live, and the rename had turned them into 404s.

Our Story renders `s3_title` and `s3_closing_text` as two paragraphs. A Key
Text field cannot hold a paragraph break, and this needed no model change.
The size is `text-lg! lg:text-2xl!`, 24px on desktop and 18px below 1024,
between the old h3 (28px) and the bullets (16px). The `!` is required:
`app.css` sets `p { font-size: 16px }` unlayered, and that beats any layered
Tailwind utility. The founder photo (2073×1930) sits in the square frame
with `object-cover object-right`, cropping from the left, where Erik left
room for it.

The copy and photo were not staged in Prismic: the Prismic MCP connector is
not activated for this repository. The manual steps are reddoor-maintenance
Operator decision 79. Publish them before merging this, or `/our-story`
shows the old purchasing line under its new heading.

## 2026-10-05 — Our Story drops the purchase bullets

The operator asked for the five "Every second counts…" bullets to come off
Our Story; they were product copy left over from the AED Purchases page, and
Erik had cited them only as a size reference. The Request Info button stays.
At 1440 the text column now ends at 1101px against the photo's 1003px, so
the page is about 360px shorter. The bullets are still in the `home`
document's `s3_bullets` and still ride the page's hydration payload, since
the route loads the whole singleton. Nothing renders them; clearing the
field in Prismic is optional.

## 2026-10-05 — Every page renders from Prismic slices (on `staging`; models in #73)

The site was hand-built: four routes read the `home` singleton's flat
`s1`–`s8` fields, so every copy or nav change was a code PR. The operator
asked to move it onto slices, on a `staging` branch rather than `main`. Only
the models went to `main` (#73): `prismic-models` pushes models solely on a
merge to `main`, which its own comment calls load-bearing, and the connector
cannot create types. #73 added five slices (`home_hero`, `image_banner`,
`icon_grid`, `image_and_text` with `default` and `contactDetails`,
`community_feature`) and a `navigation` group on `home`, with placeholder
components. Every prerendered page of main and #73 compared equal after
normalising hashed asset names (11 files, 0 differ); one changed word made
the comparator report its page.

Before publishing the content I believed a `page` doc with uid
`aed-programs` would break main's prerender, because `[uid]`'s `entries()`
would emit a path a static route owns, and SvelteKit fails on an entry
matched by a different route. A build with a fake colliding entry passed.
SvelteKit enqueues every static route first and skips a path it has already
seen (`postbuild/prerender.js`, `enqueue`), so the colliding entry is never
visited and the mismatch check never runs. A throwing `entries()` failed the
build, which proved the hook does run. So the publish was inert, and the
live site measured that way: release `asQvEBIAAHEPgEox` (`home`'s hero slice
and navigation, plus four page documents) went live at 23:16Z, and all 14
screenshots, the rendered DOM and the sitemap were identical before and
after the rebuild it triggered.

Staging renders `/` from `home`'s slices and everything else through
`[uid]`. Against live main: 14 screenshots (five pages at 1440 and 390,
plus the open nav) are pixel-identical; text, images and alt text, links and
ids match on every page; the nav's labels and hrefs match. Two class lists
differ on purpose: AED Programs' 96px under the h1 moved from the heading's
`pb-24` into the banner's `mt-24`, which a mutation (dropping it) showed the
parity check catches as a 96px-shorter page at both widths. The sitemap
lists the same five URLs, now in Prismic's order and with `lastmod`, which
the existing sitemap code already gives page documents.

The adversarial review found no blocker. Folded in: the starter's
`page`/`uid: home` resolver rule is replaced with a `home` → `/` route, so a
nav link to the home document resolves; nav items whose link resolves to
nothing are dropped instead of rendering an `<a>` with no href; `[uid]`
returns 404 only for `NotFoundError` and rethrows the rest; and the layout and
both pages type their props, which a misspelt field now proves (svelte-check
reports it). Its spacing finding was wrong (it missed the banner's
`mt-24`). Left as found: nav links in a preview session drop `/preview/`,
which predates this change, and a page with two of the same slice would
repeat its section id.

## 2026-10-06 — The icon labels' "double spaces" were U+2028, and a label can now hold a line break (#76)

Erik asked, in #caltex at 13:43Z, for three changes to the orange labels on AED Programs. He wanted the double spaces gone. He wanted a hard return after the comma in "No long-term commitment, 12-month terms.". And he wanted "12-month" kept on one line.

The double spaces were not spaces. Each was a space followed by U+2028 (LINE SEPARATOR), most likely a line break from the design copy that survived a paste. Chrome draws U+2028 as a second space, so on the page it looks exactly like a double space. A scan of every published document found 15 of them in 12 fields: three in two of the `aed-programs` page's `icon_grid` labels, and twelve in ten of `home`'s old `s2`–`s6` fields, which no page renders since the move to slices. Prismic release `asUDwhIAAMIrgcs0` removes all 15. The tool output shows U+2028 as plain whitespace, so only a byte dump (`od -c`: `342 200 250`) told the two apart.

The hard return is a `\n` stored in the Key Text label. `IconGrid`'s `<h3>` now has `white-space: pre-line`, which renders it as a break. A Key Text field stores and returns the newline (read back from the release), so no model change was needed. Unchecked: whether the editor's single-line Key Text input keeps the newline when someone next saves that label by hand. If it drops it, the label goes back to wrapping on its own, which is what it did before. A rule that breaks after any comma would have broken every label that has one. Under the new class the published content renders line for line as it did before at 1440, 1024 and 390. So this code and the release can go live in either order.

"12‑month" uses U+2011, the non-breaking hyphen `s3_title` already uses. At 1440 "12‑month terms." is one line. At 390 the text column is 140 px, so "terms." wraps. A non-breaking space between the two words held the phrase together, but pushed it 13 px past the card's edge at 390, and 28 px at 768, so it was dropped.

Not fixed here: on the live site, at 320, 360 and 768, every card's longest word already runs past the card's right edge. "replacements" overshoots by 50 px at 320. The 128 px icon and the `p-11`/`gap-11` padding leave too little room for the text column at those widths.

The new spec writes a label into the rendered card and measures it. It goes red with no class, with `whitespace-normal` (the newline test), and with `pre-wrap` or `pre` (the space-collapse test).

## 2026-10-19 — SvelteKit 3 and adapter-netlify 7, on `@reddoorla/maintenance` 0.109's `createKitConfig` (`claude/p1-53-kit3`, into staging)

Renovate's #79 (kit 3) and #80 (adapter-netlify 7) could only land together, because adapter 7 peers kit `^3`, and each was red alone. This replaces both. It is the factory-shaped port (reddoorla/reddoor-maintenance P1-53), done the way la-homelessness-youth#32 did it: `svelte.config.js` became `sveltekit.config.js` calling `createKitConfig` with the same adapter options and the same refusal of `VITE_REDDOOR_GATE_FIXTURES` on Netlify, `vite.config.js` hands it to `sveltekit(kitConfig)`, and `eslint.config.js` imports it. `@reddoorla/maintenance` went from `^0.90.0` to `^0.109.0`, the first release whose peer range admits kit 3. The twenty-five releases between are almost all CLI, report and fleet changes; nothing this site imports (`configs/svelte`, `configs/eslint`, `configs/playwright-a11y`, `images`) changed shape except the new `createKitConfig`, and `pnpm check` and `pnpm lint` came out the same as before.

Two things the bump forced that the Renovate PRs did not show. Kit 3.1.0 peers svelte `^5.57.1` and the lockfile held 5.57.0, so svelte moved to 5.57.2. And `pnpm-workspace.yaml` carried a security floor, `"@sveltejs/kit>cookie": "^0.7.0"`, for kit 2's `cookie ^0.6`. Under kit 3, which asks for `cookie ^2.0.1`, that override pinned it back to 0.7.2, and the dev server died on every request with `Named export 'stringifySetCookie' not found`. The build did not notice. The first sign was the Playwright webServer timing out after 120 s. The floor's own comment said to remove it once the parent range caught up, and kit 3's range is above it, so it is gone and kit gets cookie 2.0.1.

The site had one `$app/stores` import, in the root layout (`$page.data.*` for the head tags and `$page.url` for the preview guard). Kit 3 removed those stores outright, so every page would have thrown `app_stores_removed`; it is on `$app/state` now. `/health` read the three form variables through `$env/dynamic/*`, which kit 3 turns into a view of `src/env.ts`'s declared list. With no `src/env.ts` the probe would have reported every variable unset on Netlify, with only a build warning. The starter's `src/env.ts` declares exactly those three, and `/health` reads them through `$app/env/*`. This site has no form yet, so `/health` is the only reader. The `preview` param matcher moved from `src/params/preview.js` into `src/params.ts`. It now returns the segment or `undefined`, because kit 3 counts a returned `false` as a match. The root layout renders a local `PrismicPreview` (copied from reddoor-starter#188), because `@prismicio/svelte` 2.2.1 still calls `goto` with `noScroll`, which kit 3 rejects in dev and ignores in production. Two `error(404, { message })` calls became `error(404, message)`, `Handle` comes from `@sveltejs/kit/hooks`, and `tsconfig.json` extends `$app/tsconfig` with its own `include`.

The site never opted into the central CSP and still does not. There was no `prerender.origin` and nothing prerendered reads `url.origin`: the sitemap uses `$lib/site`'s `SITE_URL`. So `paths.origin` stays unset, and there was no origin plumbing to port. A production build with `URL=https://www.caltexmedical.com` prerendered the same 5 HTML pages before and after the move, and none of the `.html`, `.xml` or `.txt` files contains `sveltekit-prerender` in either build.

The gate is `tests/kit-config.spec.ts`, ported from 1836dig's Playwright form of the starter's `kit-config.test.ts`, because `test:smoke` is the only runner CI uses here. Its first run on the migrated tree had two failures, and both were the instrument's fault. The no-CSP assertion expected an empty `directives` object, but kit fills every directive with `undefined` or `false`. The matcher test called `params.preview(...)` as a function, but `defineParams` wraps each matcher as a standard schema (`["~standard"].validate`). Once both were fixed, it ran 11 of 11 green. I then ran four mutations, each red. A restored `svelte.config.js` failed both the build (`config_file_unsupported`) and the gate run, whose webServer exits 1 before any test runs. A `$app/stores` import put back in the layout, `paths.origin` set, and `FORMS_INGEST_TOKEN` removed from `src/env.ts` each failed exactly one gate test. I checked `/health` on `vite preview` of the build in both directions. With the three variables set it gave `{"ok":true,"prismic":"ok","forms":{"ingestUrl":true,"ingestToken":true,"turnstile":true}}`. With all three unset it gave all three `false`. One belief turned out wrong: the first unset run still said `true` for the ingest pair, because this container exports `FORMS_INGEST_URL` and `FORMS_INGEST_TOKEN` itself. The negative control has to `env -u` them. `svelte-check` reports 0 errors and 0 warnings, the same as `staging` before the change. The build adds one new warning, kit 3's `config_option_deprecated_alias`, which is expected until the `#lib` subpath-import follow-up.

## 2026-10-20 — `staging` recut, and Renovate on the staging flow (#91, `b765f0e`, into `staging`)

P1-53's promotion merge deleted `staging`: `delete_branch_on_merge` removes a PR's head on merge, and `staging` had no ruleset to stop it. `main-gate` stayed on `main`, and it admits only a PR from `staging` or a Renovate patch or minor labelled `fast-track`. So Renovate's lock-file maintenance (#86) and non-major group (#66) failed it on "no 'fast-track' label". `staging` was pushed back at `main`'s head (`161fb77`, 19:31Z), and Netlify already listed it in `allowed_branches`.

#91 makes `renovate.json` extend `renovate-staging-flow` after `renovate-config`, as vida-legacy-foundation, 29-navy and beachfront-dentistry do. The preset sends majors and lock-file maintenance to `staging` and labels patches and minors into `main` `fast-track`. **It does nothing yet.** Renovate reads its config from the default branch, and this repo's `renovate.yml` sets no base or config path, so the file takes effect at the next promotion. The order is the operator's: the `staging` ruleset first (otherwise Renovate could automerge lock-file maintenance into an unprotected `staging`, and the promotion merge would delete `staging` again), then the promotion, then `main-gate` as a required check on `main`, which today requires only `ci / ci`.

The validator (`renovate-config-validator --strict`, renovate 44.172.1) passed the file and failed a copy carrying `nonsenseOption: true` with exit 1. It does not resolve presets, so the preset's existence was checked separately (HTTP 200). `main-gate` refused a probe PR into `main` from a non-staging head (reddoorla/1836dig#36, closed unmerged); its file is byte-identical here. No promotion has run under `main-gate` in this repo yet, so its pass on a `staging` head is still unobserved. The record for all three repos is reddoor-maintenance's `docs/journal/2026-10-20-1945-staging-recut-three.md`.

## 2026-10-21 — `main-gate` waits for the activity feed to reach the PR head (`claude/main-gate-activity-retry`, into `staging`)

`main-gate` proves that only `reddoor-renovate[bot]` pushed to a fast-track branch by reading the repository activity feed, and that feed is eventually consistent. On 2026-10-21 it listed nothing 22–24 seconds after Renovate created the branch for reddoorla/la-homelessness-initiative#65, a vite security patch, so the gate failed closed and the PR sat red until it was re-run by hand. The file here is now reddoor-maintenance's template from reddoorla/reddoor-maintenance#1625, byte for byte. It trusts the feed only once the newest entry is the PR's head commit and the feed lists a `branch_creation`, reading again for up to 60 seconds before it fails closed. Retrying merely until the feed was non-empty was the first draft, and review rejected it: a partly filled feed could show Renovate's creation without a stranger's later push. The stranger-pusher check is unchanged. `pull_request_target` runs `main`'s copy, so this takes effect at the next promotion. The test, the mutations and the live dry run are in reddoor-maintenance's `docs/journal/2026-10-21-1440-main-gate-activity-retry.md`.

## 2026-10-27 — Ending a preview is asserted in a browser, not read from source (#101)

The fleet test audit (`reddoorla/reddoor-workspace` `audits/2026-10-26-fleet-test-audit/report.md`, batch D) flagged one test here: `tests/kit-config.spec.ts` "ends a Prismic preview through the local PrismicPreview" read `PrismicPreview.svelte` as text for `reset: false` and against `noScroll|keepFocus|invalidateAll`. It restated the implementation, but it was the only guard against reddoor-starter#188 (ending a preview throws the editor to the top of the page), so the audit held its removal until vineyard-custom-homes' browser test was ported here.

The port is `tests/smoke/prismic-preview.spec.ts`: with the `io.prismic.preview` cookie set it opens `/preview/our-story`, scrolls to 400, dispatches `prismicPreviewEnd` until the mount-time listener navigates, and asserts the path becomes `/our-story` with `scrollY` still 400. It is vineyard's version after its run there, which found that the audit's draft waited on `toHaveURL(/\/about$/)`, a pattern the preview URL already matches. The source lines went only after the port passed. Proved against `PrismicPreview.svelte` mutants: dropping `reset: false` goes red on the dev server and on a production bundle (`scrollY` 0 against 400); dropping `endingPreview = true` and adding `noScroll: true` both go red on dev with the URL stuck on `/preview/our-story`. The unmutated production bundle passes, as does the rest of `kit-config.spec.ts`. Not seen by the old check or the new test: `invalidateAll` in place of `refreshAll` (kit 3.1 maps it) and `refreshAll` dropped entirely.

The same port failed on erp-industrial, where the layout's fade transition stops a preview from ending at all. This site's layout has no `beforeNavigate`, so nothing intercepts the navigation.

## 2026-11-01 — No page is wider than a phone: the nav logo, the page title and the icon grid (P1-90, #103)

The P1-90 fleet census (reddoorla/reddoor-maintenance#1876) blamed `ScreenWidthImage`'s centred `div.absolute.top-1/2.left-1/2`, 871px wide, for CalTex's sideways scroll. **That was wrong.** The div sits inside a `w-screen overflow-clip` section and widens nothing; the census's culprit walk listed the outermost element past the edge without asking whether an ancestor clips it. Hiding elements one at a time until `scrollWidth` dropped found three real causes.

**The nav logo, chosen by JS.** `viewportWidth = $state(1024)` on the server, so the prerendered page carried the 241px wordmark on every phone until hydration swapped in the mark. Meanwhile the nav row was 457px wide at 320 and 461px at 390. That is #102's "intermittent" overflow on `/`: whether a probe saw it depended on whether it measured before hydration. It is the same class as MSOT's #106, and the census's class-1 search missed it because it looked for `src=` ternaries and this one is `field=`. `SiteLogo.svelte` is now a `<picture>` that chooses at 769px, the old breakpoint, before any JS runs. It is a plain `<img>` because `PrismicImage` takes only an empty alt: review found the first version had renamed both home links from "Caltex Medical" to the mark's alt, "ct", and that an empty mark field left no logo at all. With the mark empty, the wordmark now shows from 769px only.

**The page title.** 64px Impact uppercase below 1024px: "GRANTS & COMMUNITY" reached 442px at 320, "AED PROGRAMS" 390, "CONTACT US" 331. It now sizes against its column, `min(64px, 14cqi)` or `min(115px, 14cqi)`, which keeps the design's sizes wherever the column is about 460px or wider and shrinks every title below that, short ones included. The factor was sized on the fallback font: Impact has no `@font-face`, so Linux and CI render a wider face ("COMMUNITY" about 6.6em), and visitors on macOS, iOS and Windows get the narrower system Impact. `overflow-wrap: break-word` is the backstop.

**The icon grid.** At 320, 44px padding, a 44px gap and a 128px icon left the label about 22px, and its words ran to 351px. Review measured a second band the census could not see: from 768 to about 930px the two-column cards' labels (58px wide at 768) ran out of the white card but not off the screen. The compact card (24px, 80px icon) now applies below 430px and from 768 to 1023px. At 430 to 767px and from 1024px the design is unchanged, the tightest fit being 2px at 430.

`tests/smoke/mobile-overflow.spec.ts`, ported from medical-solutions-of-texas#100, runs every route in the smoke manifest (which gains `/community` and `/contact`) at 320/390/768/820/1024px. Before the fix it failed 10 of 25. Each fix reverted alone, run twice: logo, 10 red; title, 5 red, matching the census's readings route for route; icon grid, 1 red. It measures at `load` against the dev server, which is what lets it see the pre-hydration logo. It cannot see the 768px card spill, which is inside the viewport. Two review rounds; the second was minors only, folded in here.

Seen and not touched: in the cloud container the wordmark SVG fails with `net::ERR_BLOCKED_BY_ORB` on production and on this branch alike, while curl gets a 200 `image/svg+xml`. It is probably the container's proxy; check once in a real browser.

Usage: recorded in the workspace journal entry for this session.

## 2026-11-03 — main into staging with the lockfile regenerated (#111, supersedes #109)

Both staging-flow PRs read `dirty`: #109 (main into staging) and #110 (the promotion that carries #103, P1-90). `main` took Renovate's non-major bump #104 at 11:03am PT, and `staging` had taken lock-file maintenance #105 the day before at 1:15pm PT, so `pnpm-lock.yaml` conflicted in 51 hunks. It was the only conflict. `package.json` was identical on both sides.

#109's head is `main` itself, so there was no branch to resolve the conflict on. The fix pushes nothing to `main`, which would have been a promotion. It follows the staging-flow runbook instead: cut from `staging`, merge `main`, and let `pnpm install` (12.5.1, the pinned `packageManager`) resolve the conflicted lockfile rather than picking a side. Every one of the 26 direct dependencies came out at or above both sides. Four went a patch or minor past both, re-resolved within their ranges: `@lucide/svelte` 1.67.0, `tailwindcss`/`@tailwindcss/vite` 4.3.4, `eslint-plugin-svelte` 3.24.0, `prismic` 1.25.0. Frozen install, lint, check (0 errors), build and `test:smoke` (52 passed) all passed locally.

Belief corrected: the brief said to land with maintenance's `land-prs.mjs`. Its dry run picked `method=squash` for `staging`, and a squash drops `main` as a parent, so #110 would have stayed conflicted, exactly as #88 had to be redone as #89. #111 lands with `PUT pulls/111/merge`, `merge_method=merge`, pinned to the green head.

## 2026-11-04 — svelte-select leaves: nothing had imported it since May (#112)

`svelte-select` had been a dead dependency since 2026-05-28. That day `e636275` deleted the 19 unused components that imported it, and `8b8ff80` dropped `svelte-gestures` but not this package. On 11-04 the operator chose removal over a bump to 6, which would mean a Svelte 5 API rewrite for a package nothing renders (workspace `decisions/2026-11-04-1740-select-gestures-keep-or-replace.md`). The dependency goes, and with it the lockfile's `svelte-floating-ui` and `@floating-ui/*`: 38 lines, nothing else. So does the "svelte-select stylings" block in `app.css`, 57 lines up to `.filter-to-dark`. That block held two `::placeholder` rules, deleted with it because `src` has no `<input>`, `<textarea>`, `<form>` or `{@html}` for them to style. `docs/UPGRADE_NOTES.md` stops listing both packages in its stack table, and a line under the table says when each left.

Proof, after a fresh install in a new clone:

- `grep -rn "svelte-select\|svelte-gestures" src` prints nothing.
- `pnpm lint` is clean, and `pnpm check` gives 0 errors and 0 warnings. `pnpm build` passes, and `pnpm test:smoke` passes 52 of 52.
- Re-adding `import Select from "svelte-select"` to `slice-simulator/+page.svelte` turned `pnpm check` red: `Cannot find module 'svelte-select'`, 1 error.
- An Opus review of the diff found it clean.

## 2026-11-04 — `@prismicio/svelte` 2 → 3 (this PR, into `staging`)

Part of the fleet majors sweep (reddoorla/reddoor-maintenance#1949, phase 2 group A), following the ERP pilot's recipe. It waited for the svelte-select removal (#112), which merged into `staging` at about 10:16am PT, and is cut from that `staging` at `5b1a3a0`. Renovate's own v3 PR was still "Awaiting Schedule" on the Dependency Dashboard (#46).

`@prismicio/svelte` goes from 2.2.4 to 3.2.0. `@prismicio/client`'s specifier goes from `^7.21.8` to `^7.23.0`, v3's peer floor. **No call site needed a change.** The slice simulator already used v3's `{#snippet children({ slices })}` form. Nothing imports `SvelteRichTextSerializer`. The site ships its own `PrismicPreview` copy, so v3's move of the package's copy to the v5 toolbar does not reach it.

Measured on Node 24.22.2, on this branch and on `staging` in a separate worktree. Both had lint clean, `svelte-check` at 0 errors and 0 warnings, and the build green. There is no vitest here; CI's `test:smoke` covers it. All 5 prerendered pages are identical once asset hashes, the kit version, the `__sveltekit_<id>` name, the CSP hash and HTML comments are normalised. That includes the modulepreload count, unlike reddoor-website and Roalson the same day: this site's simulator was already on v3's runes-mode form, so no legacy-mode chunk dropped out. v3 writes 6 `prismic-slice-start` markers across those 5 pages (2 on `/aed-programs`, 1 on each of the others) against 0 on v2. Mutation: putting the v2 `<SliceSimulator let:slices>` slot back gives `svelte-check` `'$$_rotalumiSecilS0.$$slot_def' is of type 'unknown'` on v3, and the same file passes on v2.

The review (runtime, tests, deps) found two nits, both folded in. The marker count above now says how the 6 are spread. `engines.node` goes from `>=20` to `>=22`, the floor v3 and `@prismicio/client` 7.23 declare; CI and Netlify already run 24. The reviewer ran Playwright on `pnpm preview` for both builds: `/` and `/aed-programs` hydrated with 0 console errors, and a client-side navigation between them kept v3's markers without a full reload.
