import { seo } from "stoneware";
import type { PageProps } from "stoneware";
import { Layout } from "../lib/Layout.tsx";
import { CodeBlock } from "../lib/highlight.tsx";
import { DOCS } from "../lib/docs.ts";
import { REPO_SLUG, REPO_URL, SITE_URL, siteURL } from "../lib/site.ts";
import { themeFromRequest } from "../lib/theme.ts";
import InstallCommand from "../islands/InstallCommand.tsx";
import LiveCounter from "../islands/LiveCounter.tsx";

/**
 * Measured on this site's own production build (gzipped), not estimated.
 * Reproduce with: stoneware build --root example, then gzip .stoneware/static/*.js
 */
export function head(_props: PageProps) {
  return seo({
    canonical: siteURL("/"),
    openGraph: {
      title: "Stoneware — shape your web application at build/server time",
      description:
        "A Bun-native, server-first web framework where HTML is the default and JavaScript is opt-in.",
      siteName: "Stoneware",
      image: "/mark.svg",
    },
    x: { card: "summary" },
    robots: { index: true, follow: true, maxImagePreview: "large" },
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Stoneware",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Cross-platform",
      softwareVersion: "0.2.0",
      url: SITE_URL,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  });
}

const STATS = [
  { label: "Client runtime", value: "3.2 KB" },
  { label: "One island", value: "0.2 KB" },
  { label: "Page with no islands", value: "0 B" },
  { label: "Runtime deps", value: "1" },
];

const PROBLEMS = [
  {
    problem: "You ship a runtime to render a document",
    answer:
      "A page with no islands ships zero bytes — no runtime, no hydration shim, no script tag. Asserted by the test suite, not just intended.",
  },
  {
    problem: "The client/server boundary drifts",
    answer:
      "The boundary is a directory, enforced by the build. Files under routes/ are never handed to the bundler, so they cannot reach the client.",
  },
  {
    problem: "You hydrate things that will never change",
    answer:
      "The header, footer and article have nothing to hydrate. They are strings the server produced, and they stay that way.",
  },
  {
    problem: "Security is opt-in, and CSP is what everyone skips",
    answer:
      "Stoneware never emits inline executable script, so script-src 'self' just works. This site runs under the default policy, unmodified.",
  },
];

const PRINCIPLES = [
  {
    title: "Server-first",
    body: "Every route renders to a complete HTML string. A page with no islands ships zero bytes of JavaScript — not a small runtime, not a hydration shim, nothing.",
  },
  {
    title: "No component model",
    body: "Templates are plain functions: props in, markup out. No classes, no hooks, no lifecycle. Logic lives in ordinary functions, not inside UI definitions.",
  },
  {
    title: "Signals, not an engine",
    body: "Islands use Preact Signals directly. Stoneware does not implement a reactive graph — that is a deliberate scope boundary, not an oversight.",
  },
  {
    title: "Interactivity by location",
    body: "A file under islands/ hydrates. A file under routes/ never does. No per-file directive to remember, and no way to make a page interactive by accident.",
  },
  {
    title: "Safe before configured",
    body: "Auto-escaping, automatic CSRF verification, and a restrictive CSP need no configuration to be on. The unsafe path requires typing more.",
  },
  {
    title: "Bun's own APIs",
    body: "Bun.serve, Bun.build, Bun.escapeHTML, Bun.CSRF, Bun.FileSystemRouter. No npm package reimplementing something the runtime already ships.",
  },
];

/**
 * Deliberately four capabilities rather than a claim about rankings. Each one
 * is either enforced by the build or checkable in the served HTML — nothing
 * here rests on how a search engine happens to weight anything this quarter.
 */
const SEO_POINTS = [
  {
    point: "The document is complete in the first response",
    detail:
      "A crawler that never runs JavaScript still sees every word, because nothing is assembled on the client. What you get with curl is what gets indexed.",
  },
  {
    point: "One call writes the whole head",
    detail:
      "seo() covers canonical, robots, hreflang alternates, Open Graph with article metadata, X cards and JSON-LD. Call it from the wrong place and the tags land in <body>, where nothing reads them — so the dev server warns you, naming the route.",
  },
  {
    point: "A page with no islands has no script to block on",
    detail:
      "No runtime to fetch and parse, and no hydration pass between the HTML arriving and the page being usable. Not a small runtime — no script tag at all.",
  },
  {
    point: "The export names your broken internal links",
    detail:
      "Links pointing at pages the static export did not write are reported at build time, rather than found by a crawler weeks after they shipped.",
  },
];

const ISLAND_EXAMPLE = `// islands/Counter.tsx — the only file here that ships JS
import { signal } from "stoneware/signals";

const count = signal(0);

export default function Counter() {
  return (
    <button onClick={() => count.value++}>
      Clicked {count} times
    </button>
  );
}`;

export default function Home({ request }: PageProps) {
  return (
    <Layout
      title="Stoneware — shape your web application at build/server time"
      description="A server-first, Bun-native web framework. Complete HTML by default, islands for interactivity, signals inside islands, security on before you configure anything."
      section="home"
      theme={themeFromRequest(request)}
    >
      <section class="shell hero">
        <p class="eyebrow eyebrow--glaze rise">Bun-native · server-first · v0.2.0</p>
        <h1 class="hero__title rise">
          Shape your web application at <em>build/server time</em>
        </h1>
        {/* The brand tagline, set apart from the prose: it is the shortest true
            statement of what the framework does, so it should not be buried. */}
        <p class="hero__tagline rise">
          HTML by default. <em>JavaScript by choice.</em>
        </p>
        <p class="hero__lede rise">
          Build content-heavy sites without shipping a client runtime to pages that do not need one.
          Interactivity is opt-in per directory, and the safe path is the default one.
        </p>
        <dl class="stats rise">
          {STATS.map((stat) => (
            <div class="stat">
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
        <div class="hero__actions rise">
          <a class="btn btn--solid" href="/docs/quick-start">
            Quick start
          </a>
          <a class="btn" href="/docs">
            Read the docs
          </a>
          <a class="btn" href={REPO_URL} rel="noopener">
            GitHub ↗
          </a>
        </div>
        <p class="demo-note rise">
          This site is the documentation for <a href={REPO_URL}>{REPO_SLUG}</a> — the framework's
          own source, issues, and releases live there.
        </p>
        <div class="scale rise">
          <span>Plain clay</span>
          <span>Bisque</span>
          <span>Glaze</span>
          <span>Vitrified</span>
        </div>

        {/* The kiln: a route going in and fired HTML coming out.

            It sits in the column the hero was leaving empty, and it argues the
            headline rather than decorating it — you watch a template become a
            document with nothing shipped alongside it. Typed in CSS with
            steps(), so the panel that claims zero JavaScript is itself zero
            JavaScript. Per-line widths live in the stylesheet because a style
            attribute would be refused by the default policy. */}
        <aside class="kiln">
          <header class="kiln__bar">
            <span class="kiln__dots" aria-hidden="true" />
            <span class="kiln__file">routes/index.tsx</span>
          </header>

          <div class="kiln__code">
            <span class="kiln__line">export default function Page() {"{"}</span>
            <span class="kiln__line">{"  return <article>Fired, not shipped.</article>;"}</span>
            <span class="kiln__line">{"}"}</span>
          </div>

          <p class="kiln__seam">
            <span class="kiln__seam-label">firing</span>
          </p>

          <div class="kiln__out">
            <span class="kiln__line kiln__line--out">
              {"<article>Fired, not shipped.</article>"}
            </span>
          </div>

          {/* What that route costs, for the page above and nothing else. The
              two zeros are the argument; the other two are there so they are
              read as measurements rather than as a slogan. */}
          <dl class="kiln__meta">
            <div>
              <dt>HTML</dt>
              <dd>1.1 KB</dd>
            </div>
            <div>
              <dt>JavaScript</dt>
              <dd class="kiln__zero">0 B</dd>
            </div>
            <div>
              <dt>Requests</dt>
              <dd>1</dd>
            </div>
            <div>
              <dt>Hydrated nodes</dt>
              <dd class="kiln__zero">0</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section class="shell section reveal">
        <div class="section__head">
          <p class="eyebrow">The problem</p>
          <h2>The web ships JavaScript to sites that are documents</h2>
          <p>
            Stoneware inverts the default: HTML first, JavaScript only where you ask for it. Four specific
            problems that follow from it.
          </p>
        </div>
        <dl class="problems">
          {PROBLEMS.map((entry) => (
            <div class="problem">
              <dt>{entry.problem}</dt>
              <dd>{entry.answer}</dd>
            </div>
          ))}
        </dl>
        <p class="demo-note">
          <a href="/docs/why">All seven, and the ones it deliberately does not solve →</a>
        </p>
      </section>

      <section class="shell section reveal">
        <div class="section__head">
          <p class="eyebrow">Install</p>
          <h2>One command, either runner</h2>
          <p>
            Scaffolding runs on plain Node, so it works before Bun is installed. Everything after
            that runs on Bun.
          </p>
        </div>
        <InstallCommand />
      </section>

      <section class="shell section reveal">
        <div class="section__head">
          <p class="eyebrow">Principles</p>
          <h2>Six decisions, held consistently</h2>
          <p>
            Each of these is a constraint the framework enforces rather than a convention it
            suggests.
          </p>
        </div>
        <div class="principles">
          {PRINCIPLES.map((principle, index) => (
            <article class="principle">
              <span class="principle__index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section class="shell section reveal">
        <div class="section__head">
          <p class="eyebrow">Islands</p>
          <h2>Interactivity you opt into</h2>
        </div>
        <div class="split">
          <div class="split__text">
            <CodeBlock code={ISLAND_EXAMPLE} label="islands/Counter.tsx" />
          </div>
          <div class="demo-frame">
            <p class="eyebrow">Live, on this page</p>
            <LiveCounter />
            <p class="demo-note">
              Server-rendered as static HTML, then hydrated. Clicking updates one text node — the
              tree is never re-run and nothing is diffed.
            </p>
          </div>
        </div>
      </section>

      {/* SEO as consequence, not as a pitch. The framing matters: naming this
          "the SEO framework" would be a claim about search engines, which is
          not ours to make and dates badly. Each point below is enforced by the
          build or visible in the served HTML. */}
      <section class="shell section reveal">
        <div class="section__head">
          <p class="eyebrow">Content sites</p>
          <h2>Built for pages that have to be found</h2>
          <p>
            None of this is an SEO feature bolted on. It follows from rendering the whole document
            on the server and shipping no runtime alongside it.
          </p>
        </div>
        <dl class="problems problems--wins">
          {SEO_POINTS.map((entry) => (
            <div class="problem">
              <dt>{entry.point}</dt>
              <dd>{entry.detail}</dd>
            </div>
          ))}
        </dl>
        <p class="demo-note">
          <a href="/docs/seo">The full seo() reference →</a>
        </p>
      </section>

      <section class="shell section reveal">
        <div class="section__head">
          <p class="eyebrow">Documentation</p>
          <h2>Read on</h2>
        </div>
        <div class="card-grid">
          {DOCS.map((page) => (
            <a class="card" href={`/docs/${page.slug}`}>
              <h3>{page.title}</h3>
              <p>{page.summary}</p>
            </a>
          ))}
        </div>
      </section>
    </Layout>
  );
}
