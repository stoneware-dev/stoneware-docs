import { notFound, seo } from "stoneware";
import type { PageProps } from "stoneware";
import { Layout } from "../../lib/Layout.tsx";
import { Prose } from "../../lib/Prose.tsx";
import { POSTS, POSTS_BY_DATE, getPost } from "../../lib/blog.ts";
import { REPO_ISSUES_URL, SITE_URL, siteURL } from "../../lib/site.ts";
import { themeFromRequest } from "../../lib/theme.ts";

/** Which pages `stoneware export` should generate for this pattern. */
export function staticPaths() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

/**
 * The canonical URL comes from SITE_URL rather than the request: Render
 * terminates TLS and forwards http, so a request-derived origin would declare
 * the insecure URL canonical on a site served over https. The post this page
 * carries makes that exact argument, so getting it wrong here would be a poor
 * showing.
 */
export function head({ params }: PageProps) {
  const post = getPost(params.slug ?? "");
  if (!post) return null;

  const canonical = siteURL(`/blogs/${post.slug}`);

  return seo({
    canonical,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: "Stoneware",
      type: "article",
      image: "/mark.svg",
      article: { publishedTime: post.published },
    },
    x: { card: "summary" },
    robots: { index: true, follow: true, maxImagePreview: "large" },
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.summary,
      datePublished: post.published,
      url: canonical,
      mainEntityOfPage: canonical,
      publisher: { "@type": "Organization", name: "Stoneware", url: SITE_URL },
    },
  });
}

export default function BlogPost({ params, request }: PageProps) {
  const slug = params.slug ?? "";
  const post = getPost(slug);

  // A real 404 rather than a page that says "not found" with a 200. This route
  // exists to carry an argument against soft 404s; serving one would be funny
  // for exactly as long as it took someone to notice.
  if (!post) notFound();

  const index = POSTS_BY_DATE.indexOf(post);
  const next = POSTS_BY_DATE[index + 1];

  return (
    <Layout
      title={`${post.title} — Stoneware`}
      description={post.summary}
      section="blogs"
      theme={themeFromRequest(request)}
    >
      <div class="shell">
        <article class="essay">
          <p class="eyebrow eyebrow--glaze">Writing</p>
          <h1>{post.title}</h1>
          <p class="essay__meta">
            <time datetime={post.published}>{post.published}</time>
            <span class="post__dot" aria-hidden="true" />
            <span>{post.readingTime}</span>
          </p>
          <p class="hero__lede">{post.summary}</p>

          <Prose blocks={post.blocks} />

          <nav class="doc-nav">
            <span>
              <a href="/blogs">← All posts</a>
            </span>
            <span>{next && <a href={`/blogs/${next.slug}`}>{next.title} →</a>}</span>
          </nav>

          <p class="demo-note">
            Found something wrong in the framework rather than the post?{" "}
            <a href={REPO_ISSUES_URL} rel="noopener">
              Open an issue on GitHub
            </a>
            .
          </p>
        </article>
      </div>
    </Layout>
  );
}
