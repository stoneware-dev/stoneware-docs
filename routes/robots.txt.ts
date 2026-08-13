/**
 * `/robots.txt`
 *
 * A route rather than a file in public/ for one reason: the Sitemap directive
 * must be an absolute URL, and a static file would have to hardcode the domain.
 */

import type { ActionContext } from "stoneware";

export function GET({ url }: ActionContext): Response {
  const body = ["User-agent: *", "Allow: /", "", `Sitemap: ${url.origin}/sitemap.xml`, ""].join(
    "\n",
  );

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, no-cache",
    },
  });
}
