/**
 * Single source of truth for the site's public contact info.
 *
 * Until this graduates to a Prismic global doc, edits here ship via a
 * code release. Keep `email` and `phoneTel` in sync with their display
 * forms — the prior typo (Ryan Kohen vs Kohnen) only happened because
 * the same name was hand-copied across five files.
 */
export const CONTACT = {
  name: "Ryan Kohnen",
  email: "ryan@ryankohnen.com",
  phoneDisplay: "210.273.7767",
  phoneTel: "210-273-7767",
} as const;
