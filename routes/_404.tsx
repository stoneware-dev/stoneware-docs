/**
 * The site's 404 page.
 *
 * A leading underscore marks this as a convention rather than a page: it is not
 * servable at /_404, and it is written to dist/404.html by `stoneware export`.
 */

import type { ErrorPageProps } from "stoneware";
import { Layout } from "../lib/Layout.tsx";
import { DOCS } from "../lib/docs.ts";
import { themeFromRequest } from "../lib/theme.ts";

export default function NotFound({ url, request }: ErrorPageProps) {
  return (
    <Layout
      title="Not found — Stoneware"
      description="No page at this address."
      theme={themeFromRequest(request)}
    >
      <div class="shell">
        <article class="prose">
          <p class="eyebrow eyebrow--glaze">404</p>
          <h1>Nothing is fired here yet</h1>
          <p class="hero__lede">
            No page at <code>{url.pathname}</code>. It may have moved, or it may never have
            existed.
          </p>

          <p>Somewhere to start instead:</p>
          <ul>
            <li>
              <a href="/">The home page</a>
            </li>
            {DOCS.slice(0, 4).map((page) => (
              <li>
                <a href={`/docs/${page.slug}`}>{page.title}</a>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </Layout>
  );
}
