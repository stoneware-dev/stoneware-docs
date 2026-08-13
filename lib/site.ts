/**
 * Facts about the project this site documents.
 *
 * The site is the documentation for the framework, not a separate product, so
 * the repository URL belongs in one place rather than typed into each template
 * that links to it.
 */

export const REPO_URL = "https://github.com/RANJEETJ06/Stoneware";

/** Shown where the link needs to read as a location rather than a label. */
export const REPO_SLUG = "Stoneware";

export const REPO_ISSUES_URL = `${REPO_URL}/issues`;

/**
 * Where this site is published.
 *
 * Stated rather than derived from the request. Render terminates TLS and
 * forwards an http request, so `url.origin` reports http:// on a site served
 * over https — which put `<link rel="canonical" href="http://...">` on every
 * page and told Google the insecure URL was authoritative.
 *
 * Deriving it correctly means trusting X-Forwarded-Proto, which the framework
 * does not do yet. A constant has no such ambiguity: there is exactly one
 * public origin, and this is it.
 */
export const SITE_URL = "https://stoneware-docs.onrender.com";

/** Absolute URL for a path on this site. */
export function siteURL(path: string): string {
  return SITE_URL + path;
}
