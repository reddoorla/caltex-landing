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
