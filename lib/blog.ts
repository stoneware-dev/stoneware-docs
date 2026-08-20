/**
 * Blog content.
 *
 * Plain data, the same shape documentation uses, so both render through the one
 * `Prose` component and neither knows what markup looks like. Blocks carry no
 * inline markup: `Prose` interpolates `text` and every interpolation is escaped,
 * so an asterisk or a backtick would reach the page as itself. Write the plain
 * sentence instead - it is the house style everywhere else in this repository.
 *
 * Separate from `docs.ts` on purpose. Documentation is a reference that is
 * revised in place; a post is dated and stays as written, and mixing the two
 * would put an argument from last August in the sidebar beside the routing page.
 */

import type { Block } from "./docs.ts";

export interface BlogPost {
  slug: string;
  title: string;
  /** ISO date. Rendered as-is and never round-tripped through Date, which
      would shift a date-only string by the local UTC offset. */
  published: string;
  /** One sentence, used on the index, in <meta name="description">, and in the
      link preview. */
  summary: string;
  /** Rough reading time, written rather than computed - a word count divided by
      200 is a guess presented as a measurement. */
  readingTime: string;
  blocks: Block[];
}

export const POSTS: BlogPost[] = [
  {
    slug: "seo-a-framework-should-handle",
    title: "What SEO should a modern web framework handle automatically?",
    published: "2026-08-21",
    readingTime: "12 min",
    summary:
      "Every framework ships a metadata helper. That is the least interesting part of the problem, because writing a title tag was never what broke anyone's search traffic.",
    blocks: [
      {
        kind: "p",
        text: "Every framework has an SEO story now, and almost all of them are the same story: a helper that writes meta tags. Next has Metadata, Nuxt has useHead, Astro has whatever you import this month. They are fine. They are also the least interesting part of the problem, because writing a title tag was never what broke anyone's search traffic.",
      },
      {
        kind: "p",
        text: "The interesting question is a different one: what does the framework do when you do nothing at all?",
      },
      {
        kind: "p",
        text: "A metadata API is opt-in by definition. It helps on the pages you remembered. The failures that actually cost traffic are the ones nobody remembered, because nothing errored — a 200 status on a page that does not exist, a canonical URL pointing at http, a link to a page the build silently skipped. None of those throw. None of them show up in a test. They show up in Search Console eleven weeks later.",
      },
      {
        kind: "quote",
        text: "A better test for a framework's SEO story: if a competent developer builds a content site and never once thinks about search engines, what is already correct?",
      },
      {
        kind: "p",
        text: "What follows works through the categories that answer that question, using Stoneware as the worked example — partly because I built it, and mostly because its defaults were chosen against exactly this test. Every code sample and every output below is real.",
      },

      { kind: "h2", text: "1. The document has to be complete in the first response" },
      {
        kind: "p",
        text: "This is the foundation, and it is upstream of everything else. If your content is assembled on the client, then everything downstream — canonical tags, structured data, sitemaps — is decoration on a page a crawler may or may not fully see.",
      },
      {
        kind: "p",
        text: "The honest version of this claim is measurable rather than rhetorical. Here is a 21-route content site, built three ways from byte-identical content:",
      },
      {
        kind: "figure",
        label: "one named benchmark run, 21 routes, identical markup",
        text: `                       JS on an article page   pages with zero JS
  ─────────────────────────────────────────────────────────────────
  Stoneware                            0 B             20 of 21
  Astro                                0 B             20 of 21
  Next.js (App Router)              576 KB              0 of 21`,
      },
      {
        kind: "p",
        text: "Stoneware and Astro send a document and nothing else. Next sends 576 KB of JavaScript to a page with no interactive element on it, and re-encodes the article a second time inside the HTML as an RSC payload.",
      },
      {
        kind: "code",
        language: "sh",
        label: "the test you can run yourself",
        text: `curl -s https://your-site.example/some-article | grep "a sentence from the article"`,
      },
      {
        kind: "p",
        text: "If that finds nothing, no amount of metadata will help you.",
      },
      {
        kind: "p",
        text: "Stoneware's rule here is structural rather than advisory: a file under routes/ is never handed to the bundler, so it cannot reach the client. Interactivity is opt-in per directory — a component under islands/ hydrates, and everything else is a string the server produced.",
      },
      {
        kind: "quote",
        text: "What a framework should handle automatically: rendering to complete HTML by default, with client JavaScript as the exception you ask for.",
      },

      { kind: "h2", text: "2. Status codes, and the soft 404" },
      {
        kind: "p",
        text: "This is the most common indexing bug on content sites and almost nobody talks about it.",
      },
      {
        kind: "p",
        text: "A dynamic route matches any slug. A route at /blog/[slug] happily matches /blog/asdfghjkl. Your template then looks up the post, does not find it, and — if you are not careful — renders \"Post not found\" with a 200 OK. That page is now indexable. Worse, the pattern generates infinitely many of them.",
      },
      {
        kind: "p",
        text: "The fix has to be ergonomic or people will not use it. In Stoneware it is one call that throws:",
      },
      {
        kind: "code",
        label: "routes/blog/[slug].tsx",
        text: `import { notFound, type PageProps } from "stoneware";

export default function Post({ params }: PageProps) {
  const post = getPost(params.slug);
  if (!post) notFound();      // real 404, with your error page rendered into it

  return <article>{post.title}</article>;
}`,
      },
      {
        kind: "p",
        text: "Because it throws rather than returns, it works from a helper three calls deep without every function in between passing a sentinel back up. And because its return type is never, TypeScript narrows post to present afterwards, with no non-null assertion.",
      },
      {
        kind: "figure",
        label: "what the framework answers without being asked",
        text: `  /no-such-page      404      the _404 page, Cache-Control: no-store
  /_404              404      a convention, never servable as a page
  notFound()         404      your _404 page, correct status
  a thrown error     500      the _500 page, no-store`,
      },
      {
        kind: "p",
        text: "Two details worth stealing regardless of framework. Error responses are no-store, because a 404 cached by a CDN outlives the deploy that adds the missing page — a self-inflicted outage with a long tail. And a leading underscore means a file is not servable: without that rule, routes/_404.tsx would answer a real request at /_404 with a 200, making your error page indexable content.",
      },

      { kind: "h2", text: "3. Canonical URLs that survive a reverse proxy" },
      {
        kind: "p",
        text: "This one is invisible locally and bites almost every production deployment. Every platform that terminates TLS — Render, Railway, Fly, Vercel, nginx — forwards a plain HTTP request to your app. So new URL(request.url) reports http for a site served over https, and anything absolute you build from it is wrong: the canonical tag, og:image, sitemap entries, OAuth redirect URIs.",
      },
      {
        kind: "quote",
        text: "A canonical tag pointing at http tells a crawler that your https page is a duplicate of a page that redirects. Nothing errors. The site looks perfect to you.",
      },
      {
        kind: "p",
        text: "The framework cannot simply trust the forwarded headers — they are trivially forged by anyone who can reach the app directly, and a spoofed X-Forwarded-Host poisons every absolute URL you emit, including password-reset links. So it has to be a decision rather than a default:",
      },
      {
        kind: "code",
        language: "ts",
        label: "stoneware.config.ts",
        text: `export default defineConfig({
  trustProxy: "proto",   // or STONEWARE_TRUST_PROXY in the environment
});`,
      },
      {
        kind: "p",
        text: "The value \"proto\" honours the forwarded scheme only, which is safe on any host and enough to fix the common case. Setting it to true also honours the forwarded host, which requires a proxy you actually control.",
      },

      { kind: "h2", text: "4. The metadata API, the part everyone builds" },
      {
        kind: "p",
        text: "This is table stakes, so I will be brief. The value is not in emitting tags; it is in the mistakes the API makes impossible.",
      },
      {
        kind: "code",
        label: "routes/quiz/java.tsx",
        text: `export function head() {
  return seo({
    title: "Java Quiz",
    description: "Practice Java questions online.",
    canonical: "https://example.com/quiz/java",
  });
}`,
      },
      {
        kind: "code",
        language: "txt",
        label: "the whole output",
        text: `<title>Java Quiz</title>
<meta name="description" content="Practice Java questions online.">
<link rel="canonical" href="https://example.com/quiz/java">`,
      },
      {
        kind: "p",
        text: "Three fields in, three tags out, and an omitted field produces no tag rather than an empty one. The four things worth automating are all silent failures when written by hand:",
      },
      {
        kind: "list",
        items: [
          "Relative image paths become absolute. A relative og:image is dropped by most crawlers, and you find out when someone shares the link.",
          "Open Graph uses property, not name. Writing name=\"og:title\" is the most common hand-written metadata bug and it does nothing at all.",
          "Social titles fall back to the top-level ones, so the common case is written once instead of three times.",
          "The card type defaults correctly: summary_large_image when there is an image, summary when there is not, because a large-image card with no image renders as a bare link.",
        ],
      },
      {
        kind: "p",
        text: "There is also a nice trick available to a framework that owns the render: it can tell when you called the metadata helper from the wrong place. Tags in the body are read by nothing.",
      },
      {
        kind: "code",
        language: "txt",
        label: "development only",
        text: `[stoneware] seo() was called while rendering /about, not from its head export.
  Those tags land in <body>, where nothing reads them. Move the call into:
    export function head(props) { return seo({ ... }); }`,
      },

      { kind: "h2", text: "5. sitemap.xml, and why auto-generation is the wrong default" },
      {
        kind: "p",
        text: "Here is a place I think most frameworks get the philosophy wrong. A framework knows every route pattern in your project, so it is technically trivial to enumerate them into a sitemap. Several frameworks do, and it feels like a feature.",
      },
      {
        kind: "p",
        text: "It is a mistake. A sitemap is not a list of routes that exist. It is a list of pages you are asking a search engine to index, and the difference between those two sets is editorial: a checkout confirmation, anything behind a login, paginated archives you would rather have crawled through links, a legal page you must host but do not want ranking. All routes. None of them entries.",
      },
      {
        kind: "quote",
        text: "A framework that guesses produces a file that is confidently wrong, and confidently wrong is worse than absent. The right split is that the framework owns XML correctness and you own the editorial decision.",
      },
      {
        kind: "code",
        language: "ts",
        label: "routes/sitemap.xml.ts",
        text: `import { sitemap } from "stoneware";
import { SITE_URL } from "../lib/site.ts";
import { POSTS } from "../lib/posts.ts";

export function GET(): Response {
  return sitemap(
    [
      { url: "/", changeFrequency: "weekly", priority: 1 },
      ...POSTS.map((post) => ({
        url: \`/blog/\${post.slug}\`,
        lastModified: post.published,
      })),
    ],
    { origin: SITE_URL },
  );
}`,
      },
      {
        kind: "p",
        text: "It is a route rather than a config file, so it can query your database and stay correct with no build step. Derive the entries from the same data the pages render and the sitemap cannot drift from the site.",
      },
      {
        kind: "p",
        text: "The parts that are genuinely easy to get wrong, and are therefore worth owning:",
      },
      {
        kind: "list",
        items: [
          "XML escaping, including the apostrophe. It is legal in a URL and illegal unescaped in XML, and HTML-escaping helpers leave it alone — producing a document some parsers reject.",
          "Relative URLs are refused rather than emitted, because a relative loc parses fine and no crawler can use it.",
          "Date-only strings pass through unchanged. Round-tripping 2026-08-13 through Date shifts it by the local UTC offset and publishes the wrong day for half the world.",
          "Limits are enforced: duplicates collapse, an out-of-range priority is refused, and more than 50,000 entries fails with a pointer to sitemap indexes.",
        ],
      },

      { kind: "h2", text: "6. robots.txt should be a route too" },
      {
        kind: "p",
        text: "There is a persistent instinct to make robots.txt a static file. Do not. The moment you have a staging environment you want Disallow, and the moment you have a sitemap you want its absolute URL in there.",
      },
      {
        kind: "code",
        language: "ts",
        label: "routes/robots.txt.ts, as scaffolded",
        text: `export function GET(_context: ActionContext): Response {
  const body = \`User-agent: *
Allow: /

Sitemap: \${siteURL("/sitemap.xml")}
\`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, no-cache",
    },
  });
}`,
      },
      {
        kind: "p",
        text: "Because it is ordinary code, making staging safe is a two-line change rather than a deployment ritual. Serving a permissive robots.txt from a staging domain is one of the fastest ways to get duplicate content indexed under a URL you do not control.",
      },

      { kind: "h2", text: "7. Broken links, caught at build time" },
      {
        kind: "p",
        text: "Internal links that point nowhere leak crawl budget and dead-end users, and they are invariably found by a crawler weeks after they shipped. A framework that prerenders your site already has everything it needs to check this — it knows every file it wrote and can read every link it emitted.",
      },
      {
        kind: "code",
        language: "sh",
        text: `stoneware export --strict`,
      },
      {
        kind: "p",
        text: "The export follows every same-origin href and src in the pages it wrote and reports anything resolving to nothing. The src half matters as much as href: a missing stylesheet or script chunk is the same class of failure and much easier to ship unnoticed. It also reports any route skipped for lacking a staticPaths export. With the strict flag, either one fails the build instead of printing a note you scroll past.",
      },

      { kind: "h2", text: "8. Crawl budget is a caching problem" },
      {
        kind: "p",
        text: "Search engines re-crawl. If every re-crawl transfers the full document, you are paying for it in bandwidth and in crawl budget spent re-reading pages that did not change.",
      },
      {
        kind: "p",
        text: "Stoneware gives every page a weak ETag derived from the rendered HTML, alongside Cache-Control: public, no-cache. That combination is widely misread: no-cache does not mean do not store, it means revalidate before use. A crawler with a stored copy sends If-None-Match and gets an empty 304. The validator changes exactly when the page changes, so there is no max-age to tune and no window in which a published change is invisible.",
      },
      {
        kind: "quote",
        text: "The honest cost: because the validator is a hash of the output, producing it means producing the output. A 304 still runs the route and renders the page — measured on a 14 KB document it costs about four fifths of what the 200 costs. The saving is bandwidth, not server work. Static assets are the opposite: content-hashed, immutable for a year, and a 304 there is about twenty times cheaper than sending the file.",
      },

      { kind: "h2", text: "9. Analytics, the part nobody wants to write down" },
      {
        kind: "p",
        text: "Here is where I have to be honest about a trade-off rather than sell you a feature. Stoneware ships a restrictive Content-Security-Policy on by default:",
      },
      {
        kind: "figure",
        label: "the default policy, sent on every HTML response",
        text: `  default-src 'self'
  script-src 'self'
  style-src 'self'
  img-src 'self' data:
  font-src 'self'
  connect-src 'self'
  object-src 'none'
  base-uri 'self'
  form-action 'self'
  frame-ancestors 'none'`,
      },
      {
        kind: "p",
        text: "This is possible because the framework never emits inline executable script — hydration payloads are JSON in a non-executable block, not string-concatenated into a script tag. So script-src 'self' simply works, with no nonce plumbing anywhere.",
      },
      {
        kind: "p",
        text: "And it blocks Google Analytics. Out of the box, gtag.js will not load. That is not an oversight, it is the point of a default-deny policy — but it means the framework owes you a clear path rather than a shrug. The policy is additive, so you name extra origins per directive and the defaults survive:",
      },
      {
        kind: "code",
        language: "ts",
        label: "stoneware.config.ts",
        text: `export default defineConfig({
  csp: {
    scriptSrc: ["https://www.googletagmanager.com"],
    connectSrc: ["https://*.google-analytics.com", "https://*.analytics.google.com"],
    imgSrc: ["https://*.google-analytics.com"],
  },
});`,
      },
      {
        kind: "figure",
        label: "what that produces — 'self' and the untouched directives survive",
        text: `  script-src  'self' https://www.googletagmanager.com
  img-src     'self' data: https://*.google-analytics.com
  connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com`,
      },
      {
        kind: "p",
        text: "The part that catches people: allowing the domain is not enough. The standard analytics snippet includes an inline script block that initialises dataLayer, and script-src without unsafe-inline blocks it regardless of which domains you allow. You have two honest options. Move that initialisation into a file under public/ and load it with a src attribute, which is same-origin and therefore covered by 'self'. Or add unsafe-inline to script-src, and understand that you have just disabled your main defence against cross-site scripting to save one file.",
      },
      {
        kind: "quote",
        text: "A framework's job here is to make the first option easy and the second explicit, rather than to quietly ship unsafe-inline so every analytics snippet pastes cleanly. A lot of frameworks make the opposite choice by default and never mention it.",
      },
      {
        kind: "p",
        text: "It is also worth saying that a server-first site with no client JavaScript has unusually good options here. Server-side request logging gives you page views with no third-party script, no cookie banner, and no CSP exception at all:",
      },
      {
        kind: "code",
        language: "ts",
        text: `export default defineConfig({
  observe: (event) => {
    analytics.pageview({
      route: event.route,        // "/blog/[slug]", not "/blog/hello-world"
      status: event.status,
      ms: event.durationMs,
    });
  },
});`,
      },
      {
        kind: "p",
        text: "The route field is the pattern rather than the path, which is what you actually want as a metrics dimension.",
      },

      { kind: "h2", text: "What a framework should not do" },
      {
        kind: "list",
        items: [
          "It should not write your metadata. Making tags easy is the job; deciding what they say is not.",
          "It should not audit your content. Heading structure, alt text, internal linking and whether the page is worth reading are not checkable by a build tool, and tools that claim to check them mostly count characters.",
          "It should not enumerate your sitemap, for the reasons above.",
          "It should not promise rankings. Any framework marketing itself on search rankings is making a claim about someone else's algorithm that it cannot keep. The honest version is: here is what is in the HTML, verify it yourself.",
        ],
      },

      { kind: "h2", text: "The scorecard" },
      {
        kind: "p",
        text: "If you are evaluating a framework, or building one, these are the questions worth asking — in roughly the order they will cost you.",
      },
      {
        kind: "figure",
        label: "what should be automatic, and what should not",
        text: `  Content present in the first HTML response     yes, by default
  A dynamic route with no data returns 404       yes, one obvious call
  Conventions are not servable as pages          yes, always
  Error responses are never cached               yes, always
  URLs correct behind a TLS-terminating proxy    one explicit setting
  Metadata protocol details and fallbacks        yes
  Warning when metadata lands somewhere useless  yes, in development
  Sitemap XML correctness                        yes
  Sitemap contents                               no — yours
  robots.txt scaffolded and environment-aware    scaffolded, then yours
  Broken internal links caught at build          yes, with a flag to fail
  Correct cache validators on every response     yes
  Third-party analytics working out of the box   no — and it should say so`,
      },
      {
        kind: "p",
        text: "Most frameworks score well on exactly one row of that table: metadata. That is the row that is easiest to build and the one that matters least, because it is the row you were already thinking about.",
      },
      {
        kind: "p",
        text: "The rows that quietly cost traffic are the ones where the failure is a 200 status, a correct-looking http, or a link to a page that is not there. All silent, all invisible in development, all discovered by a crawler long after they shipped. Those are the ones worth automating.",
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((post) => post.slug === slug);
}

/** Newest first, which is the only order an index of posts should be in. */
export const POSTS_BY_DATE: BlogPost[] = [...POSTS].sort((a, b) =>
  b.published.localeCompare(a.published),
);
