import { csrfFieldName, csrfToken, seo } from "stoneware";
import type { PageProps } from "stoneware";
import { Layout } from "../../lib/Layout.tsx";
import { Prose } from "../../lib/Prose.tsx";
import { DOC_GROUPS, DOC_ORDER, getDoc, getNeighbors, pagesInGroup } from "../../lib/docs.ts";
import { REPO_ISSUES_URL, SITE_URL, siteURL } from "../../lib/site.ts";
import { themeFromRequest } from "../../lib/theme.ts";
import Feedback from "../../islands/Feedback.tsx";

/**
 * Which pages `stoneware export` should generate for this pattern. A route with
 * [params] cannot be enumerated on its own, so the module names them.
 */
export function staticPaths() {
  return DOC_ORDER.map((page) => ({ slug: page.slug }));
}

/**
 * Social and search metadata for this page.
 *
 * Title and description stay in Layout, which owns the document; seo() adds
 * what a shared link needs and Layout has no business knowing about. The
 * canonical URL comes from SITE_URL rather than the request: Render terminates
 * TLS and forwards http, so a request-derived origin declared the insecure URL
 * canonical on a site served over https.
 */
export function head({ params }: PageProps) {
  const page = getDoc(params.slug ?? "");

  // An unknown slug still matches this route, so it renders a "no such page"
  // body with a 200 - a soft 404. Nothing here should be indexed or treated as
  // canonical, or the miss ends up in search results.
  if (!page) return seo({ robots: { index: false, follow: true } });

  const canonical = siteURL(`/docs/${page.slug}`);

  return seo({
    canonical,
    openGraph: {
      title: `${page.title} — Stoneware`,
      description: page.summary,
      siteName: "Stoneware",
      type: "article",
      image: "/mark.svg",
    },
    x: { card: "summary" },
    robots: { index: true, follow: true, maxImagePreview: "large" },
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: page.title,
      description: page.summary,
      url: canonical,
      isPartOf: { "@type": "WebSite", name: "Stoneware", url: SITE_URL },
    },
  });
}

export default function DocPage({ params, request }: PageProps) {
  const slug = params.slug ?? "";
  const page = getDoc(slug);
  const theme = themeFromRequest(request);

  if (!page) {
    return (
      <Layout
        title="Not found — Stoneware"
        description="No such documentation page."
        section="docs"
        theme={theme}
      >
        <div class="shell docs">
          <DocsNav current={slug} />
          <article class="prose">
            <h1>No such page</h1>
            <p>
              Nothing is published at <code>{slug}</code>.
            </p>
            <p>
              <a href="/docs">Back to the documentation index</a>
            </p>
          </article>
        </div>
      </Layout>
    );
  }

  const { previous, next } = getNeighbors(slug);

  return (
    <Layout
      title={`${page.title} — Stoneware`}
      description={page.summary}
      section="docs"
      theme={theme}
    >
      <div class="shell docs">
        <DocsNav current={slug} />

        <article>
          <p class="eyebrow eyebrow--glaze">Documentation</p>
          <h1>{page.title}</h1>
          <p class="hero__lede">{page.summary}</p>

          <Prose blocks={page.blocks} />

          <nav class="doc-nav">
            <span>{previous && <a href={`/docs/${previous.slug}`}>← {previous.title}</a>}</span>
            <span>{next && <a href={`/docs/${next.slug}`}>{next.title} →</a>}</span>
          </nav>

          <div class="section">
            <Feedback token={csrfToken()} fieldName={csrfFieldName()} page={slug} />
            <p class="demo-note">
              Something wrong in the framework itself rather than the page?{" "}
              <a href={REPO_ISSUES_URL} rel="noopener">
                Open an issue on GitHub
              </a>
              .
            </p>
          </div>
        </article>
      </div>
    </Layout>
  );
}

/**
 * The sidebar, in collapsible sections.
 *
 * `<details>`/`<summary>` rather than an island: this page ships no JavaScript
 * at all, and a disclosure widget is not worth breaking that for. The browser
 * gives us the toggle, Enter and Space, focus handling, and the "collapsed"
 * announcement for free - all of it under `script-src 'self'` with nothing to
 * relax.
 *
 * The section holding the current page is the one left open. That is decided
 * on the server, per request, which is why it needs no state and no hydration:
 * every navigation arrives with the right section already expanded.
 */
function DocsNav({ current }: { current: string }) {
  return (
    <nav class="docs__nav" aria-label="Documentation">
      {DOC_GROUPS.map((group) => {
        const pages = pagesInGroup(group);
        const id = `docs-group-${group.label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
        const holdsCurrent = pages.some((page) => page.slug === current);

        return (
          <details class="docs__group" open={holdsCurrent}>
            <summary class="docs__group-label">
              <h2 id={id}>{group.label}</h2>
            </summary>
            <ol aria-labelledby={id}>
              {pages.map((page) => (
                <li>
                  <a
                    href={`/docs/${page.slug}`}
                    aria-current={page.slug === current ? "page" : undefined}
                  >
                    {page.title}
                  </a>
                </li>
              ))}
            </ol>
          </details>
        );
      })}
    </nav>
  );
}
