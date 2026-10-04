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
