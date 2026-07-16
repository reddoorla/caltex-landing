import { createClient } from "$lib/prismicio";
// The canonical origin lives in a single $lib constant so the sitemap stays in
// lockstep with the rest of the site. Never re-hardcode the host here — a
// duplicated origin is exactly how a sister site drifted onto a stale www.
import { SITE_URL } from "$lib/site";

// Prerendered alongside the rest of the site, so Netlify serves it as a static
// file at /sitemap.xml.
export const prerender = true;

// Fixed page routes under src/routes/[[preview=preview]]/. The `home` singleton
// renders at "/"; leasing/purchases/community/contact are static page routes.
const STATIC_PATHS = ["/", "/leasing", "/purchases", "/community", "/contact"];

// Repeatable Prismic document type -> public path. The `home` type is a
// singleton served at "/" (covered by STATIC_PATHS); only `page` docs are
// dynamic. Keep in sync with the route folders under [[preview=preview]]/.
/** @type {Record<string, (uid: string) => string>} */
const TYPE_PATHS = {
  page: (uid) => `/${uid}`,
};

export async function GET({ fetch }) {
  const client = createClient({ fetch });
  const docs = await client.dangerouslyGetAll().catch(() => []);

  /** @type {Set<string>} */
  const seen = new Set();
  /** @type {string[]} */
  const urls = [];

  /** @param {string} path @param {string} [lastmod] */
  const push = (path, lastmod) => {
    if (seen.has(path)) return;
    seen.add(path);
    const loc = SITE_URL + path;
    urls.push(
      `\t<url>\n\t\t<loc>${loc}</loc>${lastmod ? `\n\t\t<lastmod>${lastmod}</lastmod>` : ""}\n\t</url>`,
    );
  };

  // Static routes first (no honest per-page lastmod — they render shared data).
  for (const path of STATIC_PATHS) push(path);

  // Then every repeatable page document, keyed by its uid.
  for (const doc of docs) {
    const build = TYPE_PATHS[doc.type];
    if (!build || !doc.uid) continue;
    push(build(doc.uid), doc.last_publication_date?.slice(0, 10));
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml" },
  });
}
