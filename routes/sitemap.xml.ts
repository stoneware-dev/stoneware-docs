/**
 * `/sitemap.xml` - every page this site publishes.
 *
 * Generated from DOCS rather than maintained by hand, so a page cannot be added
 * to the documentation and forgotten here. The origin is SITE_URL, not the
 * request: behind a TLS-terminating proxy the request arrives as http, and a
 * sitemap of http:// URLs points crawlers at the wrong copy of the site.
 */

import type { ActionContext } from "stoneware";
import { DOCS } from "../lib/docs.ts";
import { POSTS } from "../lib/blog.ts";
import { siteURL } from "../lib/site.ts";

export function GET(_context: ActionContext): Response {
  const paths = [
    "/",
    "/docs",
    ...DOCS.map((page) => `/docs/${page.slug}`),
    "/blogs",
    ...POSTS.map((post) => `/blogs/${post.slug}`),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths.map((path) => `  <url><loc>${escapeXML(siteURL(path))}</loc></url>`).join("\n") +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Crawlers re-read this often; revalidation keeps a new page visible
      // immediately without refetching the whole file every time.
      "Cache-Control": "public, no-cache",
    },
  });
}

/**
 * A sitemap is XML, not HTML, so `Bun.escapeHTML` is the wrong tool - it leaves
 * apostrophes alone, which are legal in a URL and must be escaped here.
 */
function escapeXML(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
