import { seo } from "stoneware";
import type { PageProps } from "stoneware";
import { Layout } from "../../lib/Layout.tsx";
import { POSTS_BY_DATE } from "../../lib/blog.ts";
import { REPO_SLUG, REPO_URL, siteURL } from "../../lib/site.ts";
import { themeFromRequest } from "../../lib/theme.ts";

export function head(_props: PageProps) {
  return seo({
    canonical: siteURL("/blogs"),
    openGraph: {
      title: "Writing — Stoneware",
      description: "Posts about server-first rendering, and the decisions behind the framework.",
      siteName: "Stoneware",
      type: "website",
    },
    robots: { index: true, follow: true },
  });
}

export default function BlogIndex({ request }: PageProps) {
  return (
    <Layout
      title="Writing — Stoneware"
      description="Posts about server-first rendering, and the decisions behind the framework."
      section="blogs"
      theme={themeFromRequest(request)}
    >
      <div class="shell">
        <section class="hero">
          <p class="eyebrow eyebrow--glaze">Writing</p>
          <h1>Posts</h1>
          <p class="hero__lede">
            Longer arguments that do not belong in a reference page. The documentation says what the
            framework does; these say why, and where the trade-offs fall.
          </p>
          <p class="demo-note">
            Source, issues and releases: <a href={REPO_URL}>{REPO_SLUG}</a>
          </p>
        </section>

        <section class="section">
          <div class="postlist">
            {POSTS_BY_DATE.map((post) => (
              <a class="post" href={`/blogs/${post.slug}`}>
                <p class="post__meta">
                  <time datetime={post.published}>{post.published}</time>
                  <span class="post__dot" aria-hidden="true" />
                  <span>{post.readingTime}</span>
                </p>
                <h2 class="post__title">{post.title}</h2>
                <p class="post__summary">{post.summary}</p>
                <span class="post__more">Read →</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
