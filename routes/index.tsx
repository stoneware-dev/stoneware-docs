import { seo } from "stoneware";
import type { PageProps } from "stoneware";
import { Layout } from "../lib/Layout.tsx";
import { CodeBlock } from "../lib/highlight.tsx";
import { DOC_GROUPS, pagesInGroup } from "../lib/docs.ts";
import { REPO_SLUG, REPO_URL, SITE_URL, siteURL } from "../lib/site.ts";
import { themeFromRequest } from "../lib/theme.ts";
import InstallCommand from "../islands/InstallCommand.tsx";
import LiveCounter from "../islands/LiveCounter.tsx";

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

/**
 * Four numbers a reader can check, rather than four that flatter.
 *
 * The middle two are the honest cost of the island model and they are stated
 * rather than buried: a page that hydrates something downloads 4.8 KB gzipped —
 * the shared runtime at 3.4, a second shared chunk at 1.0, and the island's own
 * entry at 0.2. Every island after the first adds only that last figure,
 * because the runtime is hoisted out once.
 *
 * Measured on a production build, gzip -9. The 4.8 KB agrees with the figure
 * the benchmark reports for this framework's index page, which is the same
 * quantity arrived at from the other direction.
 */
const STATS = [
  { label: "Page with no islands", value: "0 B" },
  { label: "Page with one island", value: "4.8 KB" },
  { label: "Each island after that", value: "0.2 KB" },
  { label: "Runtime dependencies", value: "1" },
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

/**
 * One named run: results/history/2026-08-19T18-24-23.json in the benchmark
 * repository. Sizes are deterministic between runs; timings are not, and the
 * tail least of all — which is why the tail is not quoted here at all.
 *
 * Build *time* is deliberately absent. `stoneware build` emits a server bundle
 * while Astro and Next prerender 21 files, so the comparison is not
 * like-for-like and putting it on a landing page would be the flattering
 * reading. Peak memory during the same build is the honest half of that column.
 */
const BENCH = [
  {
    metric: "JavaScript on an article page",
    stoneware: "0 B",
    against: "Astro 0 B · Next.js 576 KB",
  },
  {
    metric: "Pages shipping no JavaScript",
    stoneware: "20 of 21",
    against: "Astro 20 of 21 · Next.js 0 of 21",
  },
  {
    metric: "JavaScript on the one interactive page",
    stoneware: "4.8 KB",
    against: "Astro 0.3 KB · Next.js 173.7 KB",
    lost: true,
  },
  {
    metric: "Peak memory during the build",
    stoneware: "88 MB",
    against: "Astro 356 MB · Next.js 1143 MB",
  },
  {
    metric: "Median time to first byte",
    stoneware: "1.13 ms",
    against: "Astro 1.74 ms · Next.js 1.84 ms",
  },
  {
    metric: "Requests per second, 100 connections",
    stoneware: "2236",
    against: "Astro 1984 · Next.js 920",
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

        {/* A route going in and fired HTML coming out.

            It sits in the column the hero was leaving empty, and it argues the
            headline rather than decorating it — you watch a template become a
            document with nothing shipped alongside it. Typed in CSS with
            steps(), so the panel that claims zero JavaScript is itself zero
            JavaScript. Per-line widths live in the stylesheet because a style
            attribute would be refused by the default policy. */}
        <aside class="stoneware">
          <header class="stoneware__bar">
            <span class="stoneware__dots" aria-hidden="true" />
            <span class="stoneware__file">routes/index.tsx</span>
          </header>

          <div class="stoneware__code">
            <span class="stoneware__line">export default function Page() {"{"}</span>
            <span class="stoneware__line">{"  return <article>Fired, not shipped.</article>;"}</span>
            <span class="stoneware__line">{"}"}</span>
          </div>

          <p class="stoneware__seam">
            <span class="stoneware__seam-label">firing</span>
          </p>

          <div class="stoneware__out">
            <span class="stoneware__line stoneware__line--out">
              {"<article>Fired, not shipped.</article>"}
            </span>
          </div>

          {/* What that route costs, for the page above and nothing else. The
              two zeros are the argument; the other two are there so they are
              read as measurements rather than as a slogan. */}
          <dl class="stoneware__meta">
            <div>
              <dt>HTML</dt>
              <dd>1.1 KB</dd>
            </div>
            <div>
              <dt>JavaScript</dt>
              <dd class="stoneware__zero">0 B</dd>
            </div>
            <div>
              <dt>Requests</dt>
              <dd>1</dd>
            </div>
            <div>
              <dt>Hydrated nodes</dt>
              <dd class="stoneware__zero">0</dd>
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

      {/* The separation, in the material the framework is named for.

          A glazed pot is fired twice: a bisque firing that makes the body, then
          a glaze firing for the surface. That is exactly the difference between
          the two directories, and it is a better statement of it than boxes and
          arrows — an island is not a different kind of thing from a route, it
          is the same thing fired a second time. Only the glaze travels.

          The signature is the vitrification sweep: a heat band crosses the
          chamber and the shelf behind it turns from raw grey to celadon,
          because the transformation is the argument. The glaze branch lights a
          beat later, so the sequence reads as two firings rather than one.

          Zero JavaScript, and that is load-bearing rather than incidental — a
          section claiming this page ships no runtime cannot be the thing that
          breaks it. Every timing is in the stylesheet, which is also the only
          place the default CSP will accept one. */}
      <section class="shell section reveal">
        <div class="section__head">
          <p class="eyebrow">The separation</p>
          <h2>Two directories, two destinations</h2>
          <p>
            Nothing scans your files for a directive and decides. The boundary is a directory, and
            the build enforces it — a route is fired once and is finished, an island is fired again
            for the surface that ships.
          </p>
        </div>

        <figure class="stonewaresec">
          <figcaption class="stonewaresec__hud">
            <span class="stonewaresec__title">Stoneware, in section</span>
            <span class="stonewaresec__temp" aria-hidden="true">
              <i class="stonewaresec__coal" />
              1280 °C
            </span>
          </figcaption>

          <div class="stonewaresec__chamber">
            {/* Decorative: the heat that crosses both shelves. Drawn rather
                than marked up, because it is furniture, not content. */}
            <span class="stonewaresec__sweep" aria-hidden="true" />

            <div class="stonewaresec__shelf">
              <p class="stonewaresec__from">
                <span class="stonewaresec__dir">routes/</span>blog/[slug].tsx
              </p>
              <p class="stonewaresec__firing">
                <span class="stonewaresec__rail" aria-hidden="true" />
                <span class="stonewaresec__stamp">one firing</span>
              </p>
              <p class="stonewaresec__to">
                <span class="stonewaresec__ware">&lt;article&gt;…&lt;/article&gt;</span>
                <b class="stonewaresec__cost stonewaresec__cost--zero">0 B ships</b>
              </p>
            </div>

            <div class="stonewaresec__shelf stonewaresec__shelf--glazed">
              <p class="stonewaresec__from">
                <span class="stonewaresec__dir stonewaresec__dir--isle">islands/</span>Counter.tsx
              </p>
              <p class="stonewaresec__firing">
                <span class="stonewaresec__rail" aria-hidden="true" />
                <span class="stonewaresec__stamp">the same firing</span>
              </p>
              <p class="stonewaresec__to">
                <span class="stonewaresec__ware">&lt;button&gt;…&lt;/button&gt;</span>
                <b class="stonewaresec__cost stonewaresec__cost--zero">0 B ships</b>
              </p>

              {/* The second firing. Indented under the island shelf and joined
                  to it by a drawn elbow, because it is a branch of that row
                  rather than a third source. */}
              <p class="stonewaresec__glaze">
                <span class="stonewaresec__elbow" aria-hidden="true" />
                <span class="stonewaresec__stamp stonewaresec__stamp--glaze">then a glaze firing</span>
                <span class="stonewaresec__ware stonewaresec__ware--glaze">Counter-a1b2c3.js</span>
                <b class="stonewaresec__cost">0.2 KB ships</b>
              </p>
            </div>
          </div>
        </figure>

        <p class="demo-note">
          Both shelves come out of the first firing as finished HTML, which is why an island is
          never an empty box waiting for its script. Only the glaze is compiled for the browser, and
          only the island has one.{" "}
          <a href="/docs/how-it-works">The whole pipeline, step by step →</a>
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

      {/* Evidence, with the weakest number in the table rather than omitted.

          The landing page had no link to the benchmark at all, which is the
          one thing here that is measured rather than asserted. Every figure is
          from a single named run against twenty articles built identically in
          all three frameworks — including the row where Astro wins. Quoting
          only the favourable rows is how a benchmark stops being one. */}
      <section class="shell section reveal">
        <div class="section__head">
          <p class="eyebrow">Measured</p>
          <h2>Numbers, and where they came from</h2>
          <p>
            Twenty articles and an index — the same content, the same markup, built three ways and
            served by each framework's own production server.
          </p>
        </div>
        <div class="ledger">
          {BENCH.map((row) => (
            <div class={`ledger__row${row.lost ? " ledger__row--lost" : ""}`}>
              <p class="ledger__metric">{row.metric}</p>
              <p class="ledger__value">{row.stoneware}</p>
              <p class="ledger__against">{row.against}</p>
            </div>
          ))}
        </div>
        <p class="demo-note">
          The third row is a loss and it stays on the page: a plain script tag beats a hydrated
          island for one text box, and 0.3 KB against 4.8 KB is not close.{" "}
          <a href="/docs/benchmark">The full study, and what varies between runs →</a>
        </p>
      </section>

      <section class="shell section reveal">
        <div class="section__head">
          <p class="eyebrow">Documentation</p>
          <h2>Read on</h2>
        </div>
        {/* Grouped, and Releases left out.

            This used to render every page in DOCS as one flat grid. At thirty
            pages that had stopped being a reading order — the last thing on the
            landing page was a card for v0.1.4, which is not what anyone arrives
            wanting. The groups are the sidebar's, so the two cannot disagree. */}
        {DOC_GROUPS.filter((group) => group.label !== "Releases").map((group) => (
          <div class="docset">
            <p class="eyebrow docset__label">{group.label}</p>
            <div class="card-grid">
              {pagesInGroup(group).map((page) => (
                <a class="card" href={`/docs/${page.slug}`}>
                  <h3>{page.title}</h3>
                  <p>{page.summary}</p>
                </a>
              ))}
            </div>
          </div>
        ))}
        <p class="demo-note">
          <a href="/docs/whats-new">What changed in 0.2.0, and every release before it →</a>
        </p>
      </section>
    </Layout>
  );
}
