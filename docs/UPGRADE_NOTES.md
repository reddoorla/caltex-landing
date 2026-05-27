# Upgrade / maintenance notes — May 2026

This site was brought in line with the canonical reddoor SvelteKit + Prismic stack
during the work tracked on branch `chore/reddoor-maintenance-0.6.0-codemods`
(May 2026). The framework versions (Svelte 5 / Vite 8 / Tailwind 4) had already
been bumped in `package.json` by an earlier pass, but the wiring and code cleanup
were incomplete — so this round **finished the partially-applied migration** rather
than starting one from Svelte 4.

## Canonical references

- `~/Documents/GitHub/reddoor-starter/` — end-state file shapes (the standalone reference).
- `@reddoorla/maintenance` — the package whose CLI/recipes and config templates this
  site now consumes. Configs are owned by `sync-configs`; do not hand-edit
  `eslint.config.js` / `.prettierrc.json` / `lighthouserc.json` / `playwright.config.ts` /
  the `createSvelteConfig`-based `svelte.config.js` (they will be overwritten).
- `~/.claude/skills/svelte4-to-5-upgrade/` — the recipe + gotcha list this work followed.

## Final stack

| Area            | State after this work                                                       |
| --------------- | --------------------------------------------------------------------------- |
| Svelte          | `^5.55.9`                                                                   |
| SvelteKit       | `^2.61.1` (`@sveltejs/adapter-auto ^7.0.1`)                                 |
| Vite            | `^8.0.14`                                                                   |
| Tailwind        | `^4.3.0` via `@tailwindcss/vite ^4.3.0` (CSS-first config in `src/app.css`) |
| Icons           | `@lucide/svelte ^1.16.0` (FontAwesome removed)                              |
| Gestures        | `svelte-gestures ^5.2.2` (via `src/lib/utils/swipeAction.ts`)               |
| Select          | `svelte-select ^5.8.3`                                                      |
| Maintenance     | `@reddoorla/maintenance ^0.8.0` (published; local link removed)             |
| Node types      | `@types/node ^22.19.19`                                                     |
| Package manager | `pnpm@10.33.1`, `engines.node >= 20`                                        |

Verification bar (all green): `pnpm check` → **0 errors**, `pnpm lint` → clean,
`pnpm build` → succeeds.

## What changed, in order

1. **Tailwind 3→4 wiring (the skipped CSS migration).** Added `@tailwindcss/vite` to
   `vite.config.js`, rewrote `src/app.css` to `@import "tailwindcss"` + `@theme` +
   `@source inline(...)`, and deleted `postcss.config.js` and `tailwind.config.js`.
   Custom CSS was kept **unlayered** (not moved into `@layer base`) to preserve the
   original cascade — moving it would let utilities start overriding element styles.
2. **Config alignment to maintenance 0.8.0.** Confirmed `sync-configs --dry` reports no
   drift; pruned the now-dead `autoprefixer` + `postcss` deps; added `engines.node >= 20`.
   Removed the `pnpm-workspace.yaml` local-link override (`@reddoorla/maintenance` →
   `../reddoor-maintenance-0.8.0`) and switched to the **published** `^0.8.0`.
3. **Svelte 5 codemod hand-cleaning** — took `pnpm check` from **88 errors → 0**
   (see gotchas below).
4. **FontAwesome → Lucide.** Swapped the live route icons (`fa-bars` → `Menu`,
   `fa-close` → `X`), deleted 5 fully-unused FA components, and removed the FontAwesome
   Kit `<script>` from `app.html` (the Vimeo player script was kept — `ScreenWidthImage`
   uses `vimeoId`).
5. **Format + lint pass.** Repo-wide `pnpm format`, then resolved 44 lint errors
   (dead vars/imports, `svelte/require-each-key`, redundant `$effect` statements, one
   `any`). Added `@types/node`.

## Gotchas actually hit this run

- **The framework bump shipped without the Tailwind CSS migration**, so `tailwindcss`
  was still being fed to PostCSS via `postcss.config.js` → the dev server threw the
  "tailwindcss directly as a PostCSS plugin" error. (Skill gotcha #1, but latent rather
  than during first boot.)
- **The codemod left one file syntactically corrupted** —
  `ScreenWidthGallerySliderLarge.svelte` had a mangled `$props()` that swallowed a
  default-value array, orphaning ~15 lines as bare statements (32 errors in one file).
  Rebuilt by hand. (Skill gotcha #2, severe form.)
- **`unknown`-typed props everywhere** from the codemod's `$props()` output — fixed with
  proper `interface Props` per component.
- **`DefaultButton` had been half-migrated**: it took `onclick`/`children`, but every box
  caller still passed the old `text`/`click` API, so those buttons rendered empty with no
  handler. Made it backward-compatible (`text` fallback + `click` alias). (Skill gotcha #10.)
- **`svelte-gestures` v5 removed the `swipe` action export** — wrapped `useSwipe(..., isRaw)`
  as a classic action in `src/lib/utils/swipeAction.ts`, shared by all 6 sliders.
- **FontAwesome was 100% CDN** (no npm dep), and the 5 components still holding `<i>` tags
  were all dead code (zero references, not in the slice registry), including brand icons
  not in core Lucide — so they were deleted rather than converted.
- **The site was dogfooding a local-linked `@reddoorla/maintenance` 0.8.0** via an untracked
  `pnpm-workspace.yaml` override; switched to the published package.
- **`svelte/require-each-key` is enforced** by the maintenance eslint config (the skill had
  disabled it). Added `(i)` keys to every `{#each}` rather than disabling the rule.
- **`ComponentProps<X>` needs `typeof`** in Svelte 5 (`ComponentProps<typeof ContentBox>`).
- **`@types/node` is required** — SvelteKit's generated `.svelte-kit/tsconfig.json` declares
  `"types": ["node"]`, which errors without the dep installed.

## Deferred / out of scope

- **10 remaining `pnpm check` warnings** are acceptable pre-existing patterns:
  `state_referenced_locally` on the static slider arrays
  (`ScreenWidthGallerySlider` Large/Small), the unused CSS selector in `StyledMultiSelect`,
  and `Accordian`'s `labels` reference.
- **Newly-orphaned components.** Deleting `ContactForm` orphaned `StyledSingleSelect`;
  `StyledMultiSelect` was already unused (and has a typo import path `$lib/assests/...`).
  Both are dead and can be removed.
- **`+page.svelte` commented-out sections.** It carries large `<!-- <section> ... -->`
  blocks; their imports were removed during the lint pass. Re-add the imports if you
  uncomment, or delete the dead blocks.
- **TypeScript config migration not done.** The project still uses `jsconfig.json` and
  `vite.config.js` (not `.ts`). The maintenance canonical does not require it
  (`sync-configs` is clean), so it was left as-is.
- **Adapter.** `@sveltejs/adapter-auto` retained (matches the maintenance canonical;
  the older starter's `adapter-netlify` is superseded).
- **`dev` script** still uses concurrently's `npm:` prefix rather than `pnpm:` — cosmetic.

## Next maintenance step

The onboarding flow is `convert-to-pnpm → onboard → sync-configs → svelte-codemods → audit`.
Configs are synced and the codemod cleanup is done, so the remaining step is the **audit**:

```bash
pnpm exec reddoor-maint audit
```
