// Single source of truth for the site's canonical origin. Import this anywhere
// a fully-qualified caltexmedical.com URL is needed (sitemap, canonical tags,
// og:url, JSON-LD) so the origin can never drift out of lockstep. The live site
// is served from the www host.
export const SITE_URL = "https://www.caltexmedical.com";
