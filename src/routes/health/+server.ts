import * as privateEnv from "$app/env/private";
import * as publicEnv from "$app/env/public";
import * as prismicio from "$lib/prismicio";
import type { RequestHandler } from "./$types";

// A live probe — must never be prerendered.
export const prerender = false;

type PrismicHealth = "ok" | "error" | "skipped";

type PrismicClient = { getRepository: () => Promise<unknown> };
type PrismicModule = {
  createClient?: (opts: { fetch: typeof globalThis.fetch }) => PrismicClient;
  isPlaceholderRepo?: boolean;
};

// Server-side Prismic reachability probe. Hits the PUBLIC repository-metadata
// endpoint (getRepository — no token), time-boxed, returning ONLY a status
// string; the repository body is never included (/health is public).
async function probePrismic(fetch: typeof globalThis.fetch): Promise<PrismicHealth> {
  const mod = prismicio as PrismicModule;
  const isPlaceholder = mod.isPlaceholderRepo ?? false;
  if (isPlaceholder || typeof mod.createClient !== "function") return "skipped";
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const client = mod.createClient({ fetch });
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("prismic health probe timed out")), 5000);
    });
    await Promise.race([client.getRepository(), timeout]);
    return "ok";
  } catch {
    return "error";
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const GET: RequestHandler = async ({ fetch }) => {
  const prismic = await probePrismic(fetch);
  const forms = {
    ingestUrl: !!privateEnv.FORMS_INGEST_URL,
    ingestToken: !!privateEnv.FORMS_INGEST_TOKEN,
    turnstile: !!publicEnv.PUBLIC_TURNSTILE_SITE_KEY?.trim(),
    // CalTex ships no form: contact is the phone and email in
    // $lib/constants/contact.ts. testMode is false because nothing forwards the
    // fleet form-e2e probe's marker, and never true without a form that does,
    // or a probe submission lands as a real lead. `none` declares there is no
    // form, so the nightly form-e2e records n/a instead of listing the site
    // UNCOVERED. The probe checks the claim (it opens /contact and / without
    // submitting), and tests/smoke/health-forms.spec.ts checks the smoke routes
    // on every PR; a form on any other page is seen by neither. Remove `none`
    // in the PR that adds a form, wherever it goes.
    testMode: false,
    none: true,
  };
  // We're inside the handler, so the function ran; ok is false only when the
  // Prismic probe actively errored.
  const ok = prismic !== "error";
  return Response.json({ ok, prismic, forms });
};
