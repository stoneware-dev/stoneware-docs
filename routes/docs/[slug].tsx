import { csrfFieldName, csrfToken } from "stoneware";
import type { PageProps } from "stoneware";
import { Layout } from "../../lib/Layout.tsx";
import { Prose } from "../../lib/Prose.tsx";
import { DOCS, getDoc, getNeighbors } from "../../lib/docs.ts";
import { REPO_ISSUES_URL } from "../../lib/site.ts";
import { themeFromRequest } from "../../lib/theme.ts";
import Feedback from "../../islands/Feedback.tsx";

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

function DocsNav({ current }: { current: string }) {
  return (
    <nav class="docs__nav" aria-label="Documentation">
      <ol>
        {DOCS.map((page) => (
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
    </nav>
  );
}
