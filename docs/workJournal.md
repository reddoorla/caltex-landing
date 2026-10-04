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
