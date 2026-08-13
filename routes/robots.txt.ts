/**
 * `/robots.txt`
 *
 * A route rather than a file in public/ so it stays beside the sitemap it
 * points at, and so both take their origin from the same constant.
 */

import type { ActionContext } from "stoneware";
import { siteURL } from "../lib/site.ts";

export function GET(_context: ActionContext): Response {
  const body = ["User-agent: *", "Allow: /", "", `Sitemap: ${siteURL("/sitemap.xml")}`, ""].join(
    "\n",
  );

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, no-cache",
    },
  });
}
