/**
 * Documentation content.
 *
 * Plain data, kept out of the templates entirely (CLAUDE.md §2.2). Pages read
 * from here and render it; nothing in this file knows what markup looks like.
 */

export type BlockKind = "p" | "h2" | "code" | "list" | "quote" | "figure";

export interface Block {
  kind: BlockKind;
  /** Prose for p/h2/quote, source for code, diagram text for figure. */
  text?: string;
  items?: string[];
  language?: "tsx" | "ts" | "sh" | "txt";
  /** Header for a code block; caption for a figure. */
  label?: string;
}

export interface DocPage {
  slug: string;
  title: string;
  summary: string;
  blocks: Block[];
}

export const DOCS: DocPage[] = [
  {
    slug: "why",
    title: "What it solves",
    summary: "The specific problems Stoneware exists for — and the ones it does not.",
    blocks: [
      {
        kind: "p",
        text: "The web ships a lot of JavaScript to sites that do not need it. Stoneware makes HTML the default and JavaScript the exception.",
      },
      {
        kind: "figure",
        label: "the whole decision",
        text: `           Mostly a document?
                   │
                   ▼
              Server HTML          ──►  0 KB client JS
                   │
           Need interaction here?
                   │
                   ▼
                Island            ──►  small, local client JS`,
      },
      {
        kind: "p",
        text: "Stoneware is not a general-purpose replacement for anything. It was built for one shape of project: content-heavy, SEO-sensitive sites with a handful of interactive widgets. Within that shape, these are the problems it takes seriously.",
      },

      { kind: "h2", text: "1. You ship a runtime to render a document" },
      {
        kind: "p",
        text: "A blog post, a pricing page, a docs page: the content is fully known before the response finishes. Sending a framework runtime so the browser can reconstruct it is work nobody asked for, paid on every visit, on hardware you do not control.",
      },
      {
        kind: "p",
        text: "In Stoneware a page with no islands ships no JavaScript. Not a small runtime, not a hydration shim — zero bytes, no script tag at all. That is asserted by the test suite, not just intended.",
      },
      {
        kind: "figure",
        label: "measured on this site's own production build, gzipped",
        text: `  Whole client runtime (signals + hydrate + DOM)     ~3.4 KB
  One island, e.g. the counter on the home page       ~0.2 KB
  A page with no islands                                   0 B

  Runtime dependencies                                       1
  (@preact/signals-core — everything else is Bun's own APIs)`,
      },

      { kind: "h2", text: "2. The client/server boundary drifts" },
      {
        kind: "p",
        text: "When the boundary is a directive that propagates through the import graph, it moves without being moved. One innocent import pulls a subtree to the client, and you discover it from a bundle analyzer weeks later.",
      },
      {
        kind: "p",
        text: "Stoneware puts the boundary on the filesystem. Files under islands/ are bundler entry points; files under routes/ are never handed to the bundler at all. Server-only code does not stay server-only because a heuristic classified it correctly — it stays server-only because nothing can carry it across.",
      },
      {
        kind: "quote",
        text: "You cannot accidentally make a page interactive. There is no directive to forget, and no import that quietly changes where code runs.",
      },

      { kind: "h2", text: "3. Hydrating things that will never change" },
      {
        kind: "p",
        text: "Take a twenty-page company site where the only interactive parts are a newsletter form and a pricing calculator. A client-heavy architecture still asks the browser to boot a runtime and walk the whole page before any of it is live.",
      },
      {
        kind: "figure",
        label: "what actually needs to hydrate",
        text: `  Header        ──►  no
  Article       ──►  no
  SEO content   ──►  no
  Footer        ──►  no

  Newsletter    ──►  yes      islands/Newsletter.tsx
  Calculator    ──►  yes      islands/Calculator.tsx`,
      },
      {
        kind: "p",
        text: "The header is the same markup on every page and will never change after it is painted. Stoneware does not hydrate it, because there is nothing there to hydrate — it is a string the server produced, and it stays that way.",
      },

      { kind: "h2", text: "4. The component model costs more than it returns here" },
      {
        kind: "p",
        text: "Hook ordering rules, dependency arrays, stale closures, and memoization as a standing performance tax are a reasonable trade for a complex application UI. For a page that renders once and then mostly sits there, it is overhead with no matching benefit.",
      },
      {
        kind: "p",
        text: "A Stoneware template is a plain function, called once per request, on the server. Nothing to memoize, no render loop to reason about, no rules-of-hooks lint plugin. Reactivity exists only inside islands, where it earns its keep — and an update writes to one text node rather than re-running a tree.",
      },

      { kind: "h2", text: "5. Security is opt-in, and CSP is what everyone skips" },
      {
        kind: "p",
        text: "CSRF protection is usually middleware you have to remember on the right routes. Content-Security-Policy is usually absent, because adopting a strict one means fighting a framework that emits inline scripts and styles — so you end up with unsafe-inline, nonce plumbing, or nothing.",
      },
      {
        kind: "list",
        items: [
          "Escaping happens in the renderer. There is no global switch to turn it off.",
          "CSRF is verified in the request pipeline before any handler runs, on every mutating request. A raw <form> does not skip protection — it fails.",
          "A strict CSP ships by default and works, because Stoneware never emits inline executable script. No nonces to plumb.",
          "A production build refuses to start without a CSRF secret rather than falling back to something that appears to work.",
        ],
      },
      {
        kind: "quote",
        text: "This documentation site runs under that default policy with no overrides. If any page here needed an exception, that would be a bug in the framework rather than in the page.",
      },

      { kind: "h2", text: "6. Hydration mismatches" },
      {
        kind: "p",
        text: "Reconciling a client tree against server markup produces a whole category of bug that only appears in production, usually as a warning nobody can reproduce. Stoneware does not reconcile: it builds the island's tree and replaces the marked element outright. There is nothing to mismatch.",
      },
      {
        kind: "p",
        text: "The honest trade: this is a replacement, not a resumption. It happens as the island's bundle loads, before anyone has interacted with it, so in practice nothing is lost — but DOM state inside an island is not carried across the swap.",
      },

      { kind: "h2", text: "7. Toolchain sprawl" },
      {
        kind: "p",
        text: "A conventional setup accumulates a bundler, a dev server, a TS runner, dotenv, a CSRF library, a test runner, and the glue holding them together — each with its own config file and release cadence.",
      },
      {
        kind: "p",
        text: "Stoneware has one runtime dependency. Serving, bundling, escaping, CSRF tokens, routing, .env loading, and the test runner are all Bun's own APIs. That is a deliberate constraint, not a coincidence: if Bun ships it, Stoneware does not add a package that reimplements it.",
      },

      { kind: "h2", text: "What that looks like on a real site" },
      {
        kind: "p",
        text: "A company site: twenty pages, fifty blog posts, SEO metadata throughout, a contact form, a newsletter signup, and one pricing calculator. Almost all of it is a document. Three parts are not.",
      },
      {
        kind: "figure",
        label: "where each piece ends up",
        text: `  20 pages + 50 posts   ──►  routes/**            server-rendered HTML, 0 KB JS
  SEO metadata          ──►  routes/**            rendered, never hydrated

  contact form          ──►  routes/api/*.ts      server action, CSRF verified
  newsletter            ──►  islands/*.tsx        small island
  calculator            ──►  islands/*.tsx        small island

  everything else       ──►                       0 KB client JavaScript`,
      },
      {
        kind: "p",
        text: "The contact form does not even need an island: a <Form> posting to a server action works with JavaScript disabled, and the CSRF token is injected for you. An island is only worth it when you want the interaction to happen without a page load.",
      },

      { kind: "h2", text: "What it does not solve" },
      {
        kind: "p",
        text: "Worth stating plainly, because a framework that claims everything is useful for nothing. Stoneware has nothing to say about databases, authentication, offline support, realtime collaboration, or large-scale client state. It is a rendering and routing layer with sensible security defaults, and that is the whole of it.",
      },
      {
        kind: "p",
        text: "It also does not make a site automatically fast or automatically secure. It removes a category of framework-level mistake — unescaped interpolation, a forgotten CSRF check, an absent CSP, JavaScript shipped for no reason. Your own queries, your own auth, and your own payload sizes remain yours.",
      },

      { kind: "h2", text: "When not to use it" },
      {
        kind: "p",
        text: "The fastest way to be disappointed by Stoneware is to bring it to a problem it was not built for.",
      },
      {
        kind: "list",
        items: [
          "Genuinely app-like UI — a dashboard, an editor, anything with heavy shared client state. Use a SPA framework; that is what they are good at.",
          "You need client-side routing. Stoneware does full page loads.",
          "You need streaming SSR, resumability, or partial rendering. Deliberately deferred for v0.1.",
          "You are not on Bun. Stoneware is Bun-native by design, not Node-compatible-via-Bun.",
          "You need a large plugin ecosystem. This is v0.1; there isn't one.",
        ],
      },
      {
        kind: "p",
        text: "If your page is mostly a document with a few live parts, the trades above are nearly all upside. If it is mostly an application, almost none of them are.",
      },
    ],
  },

  {
    slug: "quick-start",
    title: "Quick start",
    summary: "Scaffold a project, run it, and understand what the two directories mean.",
    blocks: [
      {
        kind: "p",
        text: "Scaffolding runs on plain Node, so it works before Bun is installed. Everything after that — the dev server, the build — runs on Bun.",
      },
      {
        kind: "code",
        language: "sh",
        label: "terminal",
        text: `bunx create-stoneware my-site   # npx create-stoneware my-site also works
cd my-site
bun install
bun run dev`,
      },
      { kind: "h2", text: "What you get" },
      {
        kind: "list",
        items: [
          "routes/ — server-rendered pages and API routes. Never ships JavaScript.",
          "islands/ — interactive components. The only place client JS originates.",
          "lib/ — behavior functions and shared utilities.",
          "public/ — static assets, served as-is.",
          "stoneware.config.ts — port, CSP, CSRF settings.",
        ],
      },
      {
        kind: "p",
        text: "That split is the whole mental model. A component is interactive because of the directory it lives in, not because of a directive written inside it.",
      },
      { kind: "h2", text: "Your first page" },
      {
        kind: "code",
        label: "routes/index.tsx",
        text: `import type { PageProps } from "stoneware";

export default function Home({ params }: PageProps) {
  return <h1>It renders on the server</h1>;
}`,
      },
      {
        kind: "p",
        text: "A template is a plain function: props in, markup out. There is no base class to extend, no hook to call, and no lifecycle to learn. It runs once per request, on the server.",
      },
    ],
  },

  {
    slug: "project-structure",
    title: "What gets generated",
    summary: "Every file create-stoneware writes, what it is for, and what a build adds.",
    blocks: [
      {
        kind: "p",
        text: "A new project is twelve files. There is no hidden state, no lockfile-adjacent cache to understand, and nothing generated that you are not meant to read.",
      },
      {
        kind: "figure",
        label: "bunx create-stoneware my-site",
        text: `my-site/
│
├── routes/                    Server-only. Never ships JavaScript.
│   ├── index.tsx              A page. Maps to "/"
│   └── _404.tsx               Shown for any path that does not match.
│                              Leading _ means it is not itself a page.
│
├── islands/                   The only place client JS originates.
│   └── Counter.tsx            Hydrates on load. Gets its own bundle.
│
├── lib/                       Behavior functions and shared utilities.
│                              Ships JS only if an island imports it.
│
├── public/                    Served as-is, at the URL root.
│   └── styles.css             -> GET /styles.css
│
├── stoneware.config.ts             Port, CSP override, CSRF settings.
├── tsconfig.json              jsx: "react-jsx", jsxImportSource: "stoneware"
├── package.json               scripts: dev / build / start
│
├── .env                       STONEWARE_CSRF_SECRET, generated unique. Gitignored.
├── .env.example               Tracked template, no value.
└── .gitignore                 node_modules/ .stoneware/ .env`,
      },
      { kind: "h2", text: "The two directories that matter" },
      {
        kind: "p",
        text: "routes/ and islands/ are not a style preference. They are the mechanism behind the framework's central claim, and the difference is enforced by the build rather than by convention.",
      },
      {
        kind: "figure",
        label: "why the split is structural",
        text: `routes/**          islands/**
    │                  │
    │                  └──► entry point for Bun.build (browser target)
    │                             │
    │                             └──► shipped to the client
    │
    └──► never passed to the bundler at all
              │
              └──► cannot reach the client, by construction`,
      },
      {
        kind: "p",
        text: "Nothing scans your route files for a directive and decides. Server-only code is not excluded by a heuristic that might get it wrong — it is simply never handed to the bundler.",
      },
      { kind: "h2", text: "What a build adds" },
      {
        kind: "p",
        text: "stoneware build writes everything into .stoneware/, which is gitignored. Deleting it is always safe.",
      },
      {
        kind: "figure",
        label: "stoneware build",
        text: `my-site/.stoneware/
│
├── server.js               One bundle: framework + every route + every island.
│                           Routes are inlined, so no transpiling per request.
│
├── islands.json            Island name -> public chunk URL.
│                           { "Counter": "/_stoneware/Counter-jzp1gax8.js" }
│
├── static/                 Served under /_stoneware/*, immutable (content-hashed).
│   ├── Counter-jzp1gax8.js     One entry chunk per island.
│   ├── chunk-gcapcpwn.js       Shared runtime: signals + hydrate.
│   └── styles-4kq2n7wd.css     Every .css found beside your code.
│
└── entries/                Generated island entry points. Build input.`,
      },
      {
        kind: "quote",
        text: "routes/ must still exist at runtime. Route modules are inlined into server.js, but path matching reads the directory for its filenames — never for its contents.",
      },
      {
        kind: "p",
        text: "The shared chunk is why a page with three islands does not download signals three times. Each island entry is small; the runtime they have in common is hoisted out once.",
      },
      {
        kind: "quote",
        text: "The stylesheet only appears if the project has a .css file under routes/, islands/ or lib/. A new project styles itself from public/styles.css instead, at a fixed URL — both work, and the co-located route is the one that scales past a single file.",
      },
    ],
  },

  {
    slug: "how-it-works",
    title: "How it works",
    summary: "The path a request takes, and what hydration does to the DOM.",
    blocks: [
      {
        kind: "p",
        text: "Stoneware is small enough to hold in your head. This page is the whole of it: one request pipeline, one render pass, and one hydration step.",
      },
      { kind: "h2", text: "The request pipeline" },
      {
        kind: "p",
        text: "Every response leaves through a single function, which is what makes the security headers structural rather than something each route remembers.",
      },
      {
        kind: "figure",
        label: "one request, start to finish",
        text: `  Request
     │
     ├─ /_stoneware/*  ─────────────────►  built island chunk        (Bun.file)
     │
     ├─ matches public/  ──────────►  static asset              (Bun.file)
     │
     ├─ router.match(pathname)
     │      └─ no match  ──────────►  404
     │
     ├─ CSRF verify        ◄─────── every non-GET request, before any
     │      └─ invalid  ───────────►  403      handler can observe it
     │
     ├─ action route  ─────────────►  POST/PUT/DELETE handler ──┐
     │                                                          │
     └─ page route                                              │
            │                                                   │
            ├─ component(props)  ──►  VNode tree                 │
            ├─ renderToString    ──►  HTML string  (escaping)    │
            ├─ buildDocument     ──►  + payload + scripts        │
            │                                                   │
            └───────────────┬───────────────────────────────────┘
                            ▼
                  security headers applied   ◄── single exit point
                            │
                            ▼
                        Response`,
      },
      { kind: "h2", text: "The render pass" },
      {
        kind: "p",
        text: "A template is called once. It returns an inert { type, props } record, which the renderer walks depth-first, appending to a string. There is no previous tree, no diff, and nothing retained afterwards.",
      },
      {
        kind: "figure",
        label: "render-once-to-string",
        text: `  <Page />
     │
     │  Bun transpiles TSX ──► jsx("div", { children: [...] })
     ▼
  VNode  { type, props }        inert data, no methods, no instance
     │
     │  renderToString walks it once
     ▼
  ┌──────────────────────────────────────────────┐
  │  string        ──► escaped via Bun.escapeHTML │
  │  number        ──► escaped                    │
  │  signal        ──► .value, then escaped       │
  │  raw("...")    ──► emitted verbatim  ◄── the only way through
  │  function type ──► called, result walked      │
  │  island        ──► marked + props collected   │
  └──────────────────────────────────────────────┘
     │
     ▼
  HTML string`,
      },
      { kind: "h2", text: "What the server sends" },
      {
        kind: "p",
        text: "An island is server-rendered with its real initial state, so there is no flash of empty content. Three things go into the response: the markup, a props payload, and one module script per distinct island.",
      },
      {
        kind: "code",
        language: "txt",
        label: "response body, abridged",
        text: `<button class="counter"
        data-stoneware-island="LiveCounter"    <-- which island
        data-stoneware-id="stoneware-1">            <-- which instance
  fired <b>0</b> times
</button>

<script type="application/json" id="stoneware-islands">
  [{"name":"LiveCounter","id":"stoneware-1","props":{}}]
</script>

<script type="module" src="/_stoneware/LiveCounter-6dhtkfqt.js"></script>`,
      },
      {
        kind: "p",
        text: "The markers sit on the island's own root element rather than a wrapper, so the served HTML has no extra node and no layout impact. That is why an island must render exactly one element at its root.",
      },
      {
        kind: "quote",
        text: 'The payload is type="application/json", which browsers never execute, and its <, >, & and U+2028/9 are escaped. Nothing user-controlled is ever concatenated into executable script source.',
      },
      { kind: "h2", text: "What hydration does to the DOM" },
      {
        kind: "figure",
        label: "server output, then the same DOM after hydration",
        text: `  BEFORE                              AFTER
  ──────                              ─────
  <button data-stoneware-id="stoneware-1">      <button data-stoneware-id="stoneware-1">
    "fired "                            "fired "        ◄─ static text
    <b>                                 <b>
      "0"                                 "0"  ◄────────── Text node, now
    </b>                                </b>              bound by effect()
    " times"                            " times"
  </button>                           </button>
                                        ▲
  inert markup                          └─ click listener attached

  count.value++
      │
      └─► effect fires ─► node.data = "1"     one text node written
                                              no re-render, no diff`,
      },
      {
        kind: "p",
        text: "The client runtime builds the tree once, replaces the marked element, and attaches a subscription to the exact text node or attribute that depends on each signal. Updating a signal does not call the component again.",
      },
      {
        kind: "figure",
        label: "the client runtime, end to end",
        text: `  island bundle loads
     │
     ├─ read #stoneware-islands  ──► parsed as data, never evaluated
     │
     ├─ for each { name, id, props } matching this island:
     │      │
     │      ├─ component(props)  ──► VNode tree
     │      ├─ mountTree(vnode)  ──► real DOM nodes
     │      │      │
     │      │      ├─ signal child      ──► Text node + effect()
     │      │      ├─ signal attribute  ──► effect() -> setAttribute
     │      │      ├─ style object      ──► CSSOM (CSP-safe)
     │      │      └─ onClick           ──► addEventListener
     │      │
     │      └─ querySelector([data-stoneware-id]).replaceWith(tree)
     │
     └─ done. No further work until a signal changes.`,
      },
      { kind: "h2", text: "Why there is no reconciler" },
      {
        kind: "p",
        text: "A virtual DOM earns its cost when you re-render a whole tree and need to find what changed. Stoneware never re-renders a tree, so there is nothing to compare. The dependency graph that would justify a reconciler is already provided by signals, which is why reusing them rather than writing one is the project's firmest scope boundary.",
      },
    ],
  },

  {
    slug: "routing",
    title: "Routing",
    summary: "File-based, Next.js-style conventions resolved by Bun's own router.",
    blocks: [
      {
        kind: "p",
        text: "Routes map from the filesystem using the conventions most developers already know. Path resolution is delegated to Bun.FileSystemRouter rather than reimplemented.",
      },
      {
        kind: "code",
        language: "txt",
        label: "routes/",
        text: `routes/index.tsx          ->  /
routes/about.tsx          ->  /about
routes/blog/[slug].tsx    ->  /blog/:slug
routes/api/subscribe.ts   ->  /api/subscribe`,
      },
      { kind: "h2", text: "Pages and actions" },
      {
        kind: "p",
        text: "A module that default-exports a component is a page. A module that exports HTTP method handlers is a server action. Nothing else distinguishes them — there is no config file listing routes.",
      },
      {
        kind: "code",
        label: "routes/blog/[slug].tsx",
        text: `import type { PageProps } from "stoneware";
import { getPost } from "../../lib/posts.ts";

export default function Post({ params }: PageProps) {
  const post = getPost(params.slug);
  if (!post) return <h1>Not found</h1>;

  return (
    <article>
      <h1>{post.title}</h1>
      <time datetime={post.date}>{post.date}</time>
    </article>
  );
}`,
      },
      {
        kind: "p",
        text: "Params arrive percent-decoded and are escaped like any other value when interpolated, so a slug containing markup is inert.",
      },
    ],
  },

  {
    slug: "islands",
    title: "Islands",
    summary: "How a component earns its JavaScript, and what hydration actually does.",
    blocks: [
      {
        kind: "p",
        text: "An island is a subtree that owns its own interactivity. Everything outside it stays inert HTML forever, which means it costs nothing to send and nothing to run.",
      },
      {
        kind: "code",
        label: "islands/Counter.tsx",
        text: `import { signal } from "stoneware/signals";

const count = signal(0);

export default function Counter() {
  return (
    <button onClick={() => count.value++}>
      Clicked {count} times
    </button>
  );
}`,
      },
      { kind: "h2", text: "What happens on the server" },
      {
        kind: "list",
        items: [
          "The island renders to HTML with its initial state, so there is no flash of empty content.",
          "Its root element is tagged with a hydration marker.",
          "Its props are serialized into a non-executable JSON block.",
          "One module script per distinct eagerly-hydrated island is added before </body>.",
        ],
      },
      {
        kind: "p",
        text: "That last line says eagerly for a reason: an island can be told to wait. See when islands hydrate for the client:visible, client:idle and client:media directives.",
      },
      {
        kind: "quote",
        text: "An island must render exactly one HTML element at its root, because that element carries the marker. Stoneware raises an explicit error rather than mis-hydrating.",
      },
      { kind: "h2", text: "Updates without a reconciler" },
      {
        kind: "p",
        text: "Changing a signal does not re-run the component. The subscription is attached to the exact text node or attribute that depends on it, so the update writes one value. There is no virtual DOM and nothing to diff.",
      },
      { kind: "h2", text: "Sharing state between islands" },
      {
        kind: "p",
        text: "Export a signal from a module and import it in more than one island. They compile to separate bundles, but the bundler hoists the shared module into a common chunk, so both observe the same instance.",
      },
      {
        kind: "code",
        label: "lib/state.ts",
        text: `import { signal } from "stoneware/signals";

export const subscriberCount = signal(1284);`,
      },
    ],
  },

  {
    slug: "hydration",
    title: "When islands hydrate",
    summary: "client:visible, client:idle and client:media — and what a page stops downloading.",
    blocks: [
      {
        kind: "p",
        text: "By default an island hydrates as soon as its chunk loads. A client:* directive defers that. It goes on the usage site rather than inside the island, so the same island can be eager on one page and lazy on another without being written twice.",
      },
      {
        kind: "code",
        label: "routes/index.tsx",
        text: `<Chart />                                   {/* default: on load */}
<Chart client:visible />                    {/* scrolled into view */}
<Chart client:idle />                       {/* browser goes idle */}
<Chart client:media="(min-width: 60rem)" /> {/* query matches */}`,
      },

      { kind: "h2", text: "What the page stops downloading" },
      {
        kind: "p",
        text: "A deferred island emits no script tag at all. Its chunk URL travels inside the JSON payload instead, and the page loads a small scheduler that fetches the chunk when the trigger fires.",
      },
      {
        kind: "figure",
        label: "a page whose islands are all client:visible",
        text: `  on load                          on scroll
  ─────────────────────────        ─────────────────────────
  scheduler        ~1 KB           runtime          ~3.4 KB
                                   Chart chunk      ~1 KB
  ─────────────────────────        ─────────────────────────
  ~1 KB gzip                       fetched only if reached`,
      },
      {
        kind: "p",
        text: "The scheduler is deliberately kept clear of the DOM builder and signals. Importing either would drag the whole runtime in with it and there would be no saving left — so that boundary is enforced by a size budget in the test suite rather than by good intentions.",
      },
      {
        kind: "quote",
        text: "The chunk arrives through a same-origin dynamic import(), which script-src 'self' permits. No inline script, no nonce, and no relaxation of the default policy — the same policy this site runs under.",
      },

      { kind: "h2", text: "How each trigger behaves" },
      {
        kind: "list",
        items: [
          "client:visible starts hydrating 200px before the element reaches the viewport, so it is usually ready by the time it is on screen.",
          "client:idle waits for requestIdleCallback, with a 2s cap so a busy page still hydrates.",
          "client:media hydrates when the query matches — immediately if it already does, otherwise on the next change.",
        ],
      },
      {
        kind: "p",
        text: "Every trigger degrades to hydrating immediately when the API behind it is missing. A browser without IntersectionObserver gets a working page slightly sooner than intended, never a dead button.",
      },

      { kind: "h2", text: "Things that are errors" },
      {
        kind: "list",
        items: [
          "Two directives on one usage. There is no sensible answer to client:idle client:visible, and inventing a precedence rule to memorize would be worse than saying so.",
          "A directive on a plain element. Only islands hydrate, and rendering it as a stray attribute would look correct while never working.",
          "client:media without a query, or an unknown directive. TypeScript catches both first; the runtime check covers JavaScript and spread props.",
        ],
      },
      {
        kind: "p",
        text: "The directive is stripped before the island runs, so an island never sees client:visible among its props and needs no awareness that any of this exists.",
      },
      {
        kind: "quote",
        text: "A page with no deferred island is byte-for-byte what it was before the feature existed: no scheduler is loaded, and the payload carries no strategy field. Eager stays the default because it is the right one for a button above the fold.",
      },
    ],
  },

  {
    slug: "head-and-images",
    title: "Head and images",
    summary: "Per-page metadata, and an <Image> that fixes layout shift without a build pipeline.",
    blocks: [
      {
        kind: "p",
        text: "A page can contribute to <head> without owning the whole document. Export head alongside the default export; it receives the same props and runs in the same render context, so it can await data and call the same helpers. For metadata specifically, seo() writes these tags for you — see SEO and sharing.",
      },
      {
        kind: "code",
        label: "routes/blog/[slug].tsx",
        text: `export function head({ params }: PageProps) {
  const post = getPost(params.slug);
  return (
    <>
      <title>{post.title}</title>
      <meta name="description" content={post.summary} />
      <link rel="canonical" href={\`https://example.com/blog/\${params.slug}\`} />
    </>
  );
}`,
      },
      {
        kind: "quote",
        text: "A <title> here replaces the default rather than joining it. Two titles in one document is never what was meant, so the framework picks yours instead of emitting both.",
      },
      {
        kind: "list",
        items: [
          "It receives the same props as the page — params, request and url — so a title can come from the same slug the page rendered.",
          "It may be async. It runs inside the page's render context, so it can await data and call the same helpers the page can.",
          "Return null and nothing is added. There is no requirement to export it, and no penalty for exporting one that sometimes declines.",
          "It works whether or not the page owns its document. A page returning a bare fragment gets the framework's shell; one returning a whole <html> has the markup injected before its own </head>.",
        ],
      },
      {
        kind: "p",
        text: "One ordering detail worth knowing: head runs after the body, not before it. That is what lets a priority <Image> buried deep in the page contribute a preload that still lands in <head> — by the time the document is assembled, the body has already been rendered and everything it asked for is known.",
      },
      {
        kind: "figure",
        label: "the order a page is assembled in",
        text: `  1. body renders          <Image priority> registers a preload
  2. head() runs           your <title>, <meta>, seo(...)
  3. document assembled    preloads, then head(), then the stylesheet
                           -> all inside <head>`,
      },
      {
        kind: "quote",
        text: "This site uses it: every documentation page exports a head that calls seo(), while the layout keeps the title. Two sources, no duplicate tags, because a <title> from head replaces rather than joins.",
      },

      { kind: "h2", text: "Images" },
      {
        kind: "p",
        text: "<Image> writes the markup that hand-rolled img tags usually get wrong. Nothing to install, and nothing to configure.",
      },
      {
        kind: "code",
        label: "in a page",
        text: `<Image src="/hero.jpg" width={1200} height={600} alt="Stoneware" priority />
<Image src="/feature.jpg" width={800} height={500} alt="Feature" />`,
      },
      {
        kind: "code",
        language: "txt",
        label: "what is rendered",
        text: `<img src="/hero.jpg" width="1200" height="600" alt="Stoneware"
     fetchpriority="high" decoding="async">

<img src="/feature.jpg" width="800" height="500" alt="Feature"
     loading="lazy" decoding="async">`,
      },
      {
        kind: "p",
        text: "priority also puts a <link rel=\"preload\" as=\"image\"> in the head — with imagesrcset and imagesizes when you pass srcset and sizes, so the preloader picks the same candidate the img will rather than racing it to a different file.",
      },
      {
        kind: "quote",
        text: "That tag is written in the body but belongs in the head, which the document assembler passed long before. It travels backwards through the render context — the same mechanism csrfToken() uses to reach the response layer.",
      },

      { kind: "h2", text: "Three things that are errors" },
      {
        kind: "list",
        items: [
          "A missing alt. alt=\"\" is a real answer — it marks the image decorative — but it has to be deliberate rather than forgotten.",
          "A missing or zero width/height. The intrinsic ratio reserves space before the bytes arrive; without it the page shifts when they do. CSS can still size the element however it likes.",
          "sizes without srcset, which does nothing at all.",
        ],
      },

      { kind: "h2", text: "What it deliberately does not do" },
      {
        kind: "figure",
        label: "the line, and why it is there",
        text: `  width / height            yes      alt validation        yes
  loading="lazy"            yes      decoding="async"      yes
  fetchpriority + preload   yes      srcset / sizes        yes
  ─────────────────────────────────────────────────────────────
  resize   WebP   AVIF   compression        no — needs a codec`,
      },
      {
        kind: "p",
        text: "Bun ships no image codec, so re-encoding would mean a native dependency: a platform-specific binary and roughly thirty times the install size, for a framework whose entire dependency list is one 4 kB package. <Image> is correct markup, not a pipeline — bring your own, or ship the files you have.",
      },
    ],
  },

  {
    slug: "seo",
    title: "SEO and sharing",
    summary: "One seo() call for search engines, every social network, and rich results.",
    blocks: [
      {
        kind: "p",
        text: "Metadata is a lot of tags to remember and easy to get subtly wrong. seo() takes one object and emits only what you filled in — every field is optional, and an omitted field produces no tag rather than an empty one.",
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
        text: "Three fields in, three tags out. It is a convenience over writing them yourself, never a gate in front of them — the result is an ordinary fragment, so hand-written tags sit beside it in the same head.",
      },

      { kind: "h2", text: "There are only three audiences" },
      {
        kind: "p",
        text: "The list of networks is long; the list of protocols is not. Knowing which is which is most of the work.",
      },
      {
        kind: "figure",
        label: "who reads what",
        text: `  Open Graph        Facebook, Instagram, LinkedIn, WhatsApp,
                    Slack, Discord, Telegram, Signal, Pinterest,
                    iMessage, Teams
                    -> openGraph: { ... }

  twitter:*         X   (renamed the company, not the markup)
                    -> x: { ... }

  Google            title, description, canonical, robots
                    + schema.org for rich results
                    -> jsonLd: { ... }`,
      },
      {
        kind: "quote",
        text: "There is no instagram or linkedIn option because there would be nothing to put in one. Both read Open Graph and neither defines tags of its own — Instagram has no link-preview protocol at all.",
      },

      { kind: "h2", text: "The fuller shape" },
      {
        kind: "code",
        label: "everything is optional",
        text: `seo({
  title: "Java Quiz",
  description: "Practice Java questions online.",
  canonical: "https://example.com/quiz/java",

  openGraph: {
    image: "/images/java-quiz.png",   // made absolute for you
    imageWidth: 1200,
    imageHeight: 630,
    siteName: "Example",
    type: "article",
    article: { publishedTime: "2026-08-13", authors: [".../ada"] },
  },

  x: { card: "summary_large_image", site: "@example" },

  robots: { index: true, follow: true, maxImagePreview: "large" },

  alternates: [{ hreflang: "fr", href: "https://example.com/fr/quiz" }],

  jsonLd: { "@context": "https://schema.org", "@type": "Quiz", name: "Java Quiz" },
})`,
      },

      { kind: "h2", text: "Four things it does for you" },
      {
        kind: "list",
        items: [
          "Relative image paths become absolute, against canonical or the current origin. A relative og:image is dropped by most crawlers, and the failure is invisible until someone shares the link.",
          "Open Graph tags use property, not name. Writing name=\"og:title\" is the most common mistake in hand-written metadata and it silently does nothing.",
          "og:title, og:description, twitter:title and the rest fall back to the top-level values, so the common case is written once rather than three times.",
          "The card type defaults to summary_large_image when there is an image and summary when there is not — a large-image card with no image renders as a bare link.",
        ],
      },

      { kind: "h2", text: "Structured data" },
      {
        kind: "p",
        text: "jsonLd is the lever for Google rich results — star ratings, breadcrumbs, FAQ accordions, recipe cards. None of the meta tags above can produce them; only schema.org can.",
      },
      {
        kind: "quote",
        text: "It is serialized into a application/ld+json block, which browsers parse as data and never execute — the same mechanism the island payload uses, and the reason it needs no CSP exception. The serializer escapes <, > and the line separators, so a value cannot close the element and inject markup.",
      },
    ],
  },

  {
    slug: "error-pages",
    title: "Error pages",
    summary: "Custom 404 and 500 pages, and the three properties that hold whether or not you write them.",
    blocks: [
      {
        kind: "p",
        text: "Add routes/_404.tsx or routes/_500.tsx and it replaces the built-in page. There is no registration step and no config key — the file existing is the whole API.",
      },
      {
        kind: "code",
        label: "routes/_404.tsx",
        text: `import type { ErrorPageProps } from "stoneware";
import { Layout } from "../lib/Layout.tsx";

export default function NotFound({ url }: ErrorPageProps) {
  return (
    <Layout title="Not found">
      <h1>No page at {url.pathname}</h1>
    </Layout>
  );
}`,
      },
      {
        kind: "p",
        text: "These are ordinary templates rendered through the ordinary pipeline: your layout, your stylesheet, your islands. A 404 is a page real visitors reach, and it should not be the only one on the site that looks unfinished.",
      },

      { kind: "h2", text: "What _500 receives" },
      {
        kind: "p",
        text: "Both pages get status, message, request and url. _500 also gets error — the thrown value — populated in development only. In production it is undefined.",
      },
      {
        kind: "quote",
        text: "That is decided by the framework rather than left to each error page to handle responsibly. An exception message routinely carries a file path, a query, or a connection string, and the page that renders it is the one page guaranteed to be shown when something has already gone wrong.",
      },

      { kind: "h2", text: "When the route matched but the content does not exist" },
      {
        kind: "p",
        text: "_404.tsx only fires when nothing matched. A [slug] route matches any slug, so it reaches your template and then discovers there is no such post. Rendering not-found markup there would serve it with a 200 — a soft 404, which search engines index and which tells a client the request succeeded.",
      },
      {
        kind: "code",
        label: "routes/blog/[slug].tsx",
        text: `import { notFound } from "stoneware";

export default function Post({ params }: PageProps) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return <article>{post.title}</article>;
}`,
      },
      {
        kind: "p",
        text: "It renders your _404 page with a 404 status. Because it throws rather than returns, it works from a helper several calls deep without every function in between having to pass it back up — and it returns never, so TypeScript narrows post as present afterwards with no non-null assertion.",
      },

      { kind: "h2", text: "An underscore means it is not a page" },
      {
        kind: "p",
        text: "A route file whose name starts with _ is a convention, not something servable. Requesting /_404 does not return it with a 200 — it returns the 404 page, with a 404 status, like any other path that does not exist.",
      },

      { kind: "h2", text: "Three properties you get either way" },
      {
        kind: "list",
        items: [
          "Failure is terminal. If your _500.tsx throws, the built-in page is served — the error path never re-enters itself.",
          "Errors are never cached. Cache-Control: no-store, so a 404 held by a CDN cannot outlive the deploy that adds the page.",
          "Security headers still apply. Error responses leave through the same single exit as every other response.",
        ],
      },
      {
        kind: "p",
        text: "The first one is the reason error rendering is separate from page rendering rather than reusing it. Everywhere else, a thrown error escalates to the 500 page; here there is nowhere left to escalate to, so failure has to stop.",
      },
      {
        kind: "quote",
        text: "stoneware export writes the 404 page to dist/404.html — the file Cloudflare Pages, Netlify and GitHub Pages each serve for an unmatched path. A static export gets your error page too, not the host's default one.",
      },
      {
        kind: "p",
        text: "An error page is the response when a page could not be rendered at all. For the narrower case — one widget failed and the article around it is fine — see error boundaries.",
      },
    ],
  },

  {
    slug: "error-boundaries",
    title: "Error boundaries",
    summary: "Lose one subtree instead of the whole page, without losing the error.",
    blocks: [
      {
        kind: "p",
        text: "Without a boundary, a component that throws anywhere in a page loses the page: the request unwinds to routes/_500.tsx and a malformed row in one widget costs the article around it. On a site whose pages are mostly content, that is the wrong blast radius.",
      },
      {
        kind: "figure",
        label: "one widget throws",
        text: `  without a boundary              with one
  ──────────────────────────      ──────────────────────────
  500, the whole page gone        200, the page intact

  the reader gets an error        the reader gets the
  page instead of the article     article and a short note
                                  where the widget was`,
      },
      {
        kind: "code",
        language: "tsx",
        label: "routes/product/[id].tsx",
        text: `import { Boundary } from "stoneware";

export default async function Product({ params }: PageProps) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  return (
    <article>
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      <Boundary fallback={<p>Reviews are unavailable right now.</p>}>
        <Reviews productId={product.id} />
      </Boundary>
    </article>
  );
}`,
      },
      {
        kind: "p",
        text: "That is the whole API. No registration, no error state to hold, nothing to reset. Rendering is a single synchronous walk to a string, so catching is a try around one subtree — which is also why there is no client-side equivalent and no second pass.",
      },

      { kind: "h2", text: "notFound() is not caught" },
      {
        kind: "p",
        text: "notFound() is a routing decision travelling as an exception, not a failure. A boundary lets it through, so it still renders your _404 page with a 404 status even when thrown from deep inside a boundary's children.",
      },
      {
        kind: "quote",
        text: "If a boundary caught it, a missing post would render the fallback with a 200 — a soft 404, which search engines index and which tells a client the request succeeded. That is the bug 0.1.3 removed, and a boundary must not put it back.",
      },

      { kind: "h2", text: "The error is never lost" },
      {
        kind: "p",
        text: "A boundary that swallows errors quietly is worse than no boundary: the page looks fine and the failure is invisible. So a caught error goes two places, and neither is optional.",
      },
      {
        kind: "figure",
        label: "one widget failing on every request",
        text: `  console      the error and its stack, always —
               with no observe hook configured this
               is the only thing between a caught
               error and complete silence

  observe      event.caught carries the thrown values
               on the request they belong to, so a
               reporting backend gets the real error
               rather than a formatted line`,
      },
      {
        kind: "code",
        language: "txt",
        label: "the request line, with the built-in observer",
        text: `[stoneware] 200 GET  /product/42  15ms  /product/[id]  caught=1`,
      },
      {
        kind: "p",
        text: "The status is 200 because the request genuinely succeeded — the reader got a usable page. caught=1 is what tells you it was degraded. See observability for wiring event.caught into Sentry or a metrics backend.",
      },

      { kind: "h2", text: "Showing the error while developing" },
      {
        kind: "code",
        language: "tsx",
        label: "a fallback that reads the error",
        text: `<Boundary fallback={({ error }) => <pre>{String(error)}</pre>}>
  <Reviews productId={product.id} />
</Boundary>`,
      },
      {
        kind: "p",
        text: "error is populated in development and undefined in production — the same contract routes/_500.tsx already has, decided by the framework rather than left to each fallback to handle responsibly. An exception message routinely carries a file path, a query or a connection string, and a fallback renders into a page a visitor reads.",
      },

      { kind: "h2", text: "What a discarded subtree leaves behind" },
      {
        kind: "p",
        text: "Nothing. A child that rendered part of itself before throwing contributes none of that markup, and an island it had already registered is removed from the hydration payload — otherwise the page would name an island with no element on it, and the client would hunt for a marker that is not there while everything looked correct.",
      },
      {
        kind: "list",
        items: [
          "Boundaries nest. The innermost one that can handle the error does.",
          "A fallback that itself throws is not caught by its own boundary — that would recurse. It escalates to _500.",
          "Inside an islands/ component a boundary does nothing: the client renders its children unguarded. Islands are the one place code runs twice, and a boundary that caught on first paint but not on later updates would be worse than one that never claimed to.",
        ],
      },
      {
        kind: "quote",
        text: "Use one where a section can fail independently and the page is still worth serving — a reviews block, a recommendation strip, a third-party embed. Wrapping a whole page in one only moves your _500 page inside your layout.",
      },
    ],
  },

  {
    slug: "styling",
    title: "Styling",
    summary: "Co-located CSS, collected by the build, with no import and no link tag to maintain.",
    blocks: [
      {
        kind: "p",
        text: "Put a stylesheet next to the code it styles. The build finds it, bundles every sheet into one content-hashed file, and injects the <link> into <head> for you.",
      },
      {
        kind: "figure",
        label: "one .css beside each thing it styles",
        text: `routes/index.tsx        lib/Card.tsx        islands/Counter.tsx
routes/index.css        lib/Card.css        islands/Counter.css
        │                    │                     │
        └────────────────────┴─────────────────────┘
                             │
                    styles-4kq2n7wd.css      one file, hashed
                             │
                    <link> injected into <head>`,
      },
      {
        kind: "p",
        text: "There is nothing to import and nothing to remember. Deleting a component deletes its styles with it, because the two live in the same folder and the build stops finding one when you remove the other.",
      },

      { kind: "h2", text: "Membership is by location, not by import" },
      {
        kind: "p",
        text: "This is the part worth understanding, because it is not how most bundlers work. Routes and lib/ are server modules the bundler never sees — an import \"./Card.css\" there resolves to a path string at runtime and would never reach a stylesheet. Scanning three directories gives one rule everywhere instead of a different rule per directory.",
      },
      {
        kind: "quote",
        text: "Files are sorted before bundling, so the cascade is deterministic and the content hash changes only when the CSS does. Two builds of the same source produce the same filename, which is what makes the immutable cache header on it safe.",
      },
      {
        kind: "p",
        text: "The three scanned directories are routes/, islands/ and lib/. Anything under public/ is still served as-is at the URL root, which remains the right place for a stylesheet you want at a fixed, unhashed URL.",
      },

      { kind: "h2", text: "The style attribute does not work here" },
      {
        kind: "p",
        text: "The renderer accepts style={{ color: \"red\" }} and serialises it correctly. The browser will then refuse to apply it, because the default policy sets style-src without unsafe-inline — and that governs style attributes, not only <style> blocks. The element is there, the declaration is in the HTML, and nothing happens.",
      },
      {
        kind: "figure",
        label: "what a class buys that an attribute does not",
        text: `  style={{ color: "red" }}     emitted, then ignored by the browser

  class="note"                 works, is cacheable, and lives beside the
  + note.css                   component the build collects it from`,
      },
      {
        kind: "p",
        text: "Development warns when it sees one, naming the element and the fix. It stays silent if you have widened the policy or set csp: false, because then nothing is being blocked. The attribute is still emitted either way — a diagnostic that rewrote your markup would be worse than the problem.",
      },
      {
        kind: "quote",
        text: "An island that genuinely needs to drive a value at runtime — a progress bar, a scroll gauge — sets a CSS custom property through the CSSOM instead. CSP does not govern that, and the value stays in a stylesheet where it belongs.",
      },

      { kind: "h2", text: "Why not CSS Modules" },
      {
        kind: "p",
        text: "Bun supports CSS Modules in the bundler, but its runtime returns the file path rather than the generated class map. An island is rendered in both places — once on the server for the initial HTML, once in the browser on hydration — so the two would disagree about what a class is called, and the markup would not match the stylesheet.",
      },
      {
        kind: "code",
        label: "the mismatch",
        text: `import styles from "./Counter.module.css";

styles.button  // bundler: "Counter_button_a1b2c3"
               // runtime: undefined — the import is a path string`,
      },
      {
        kind: "p",
        text: "Rather than ship scoping that works in one half of a render and silently fails in the other, v0.1 does not offer it. Scoping is naming discipline for now — a prefix per component is enough at this size, and real scoping can arrive later without changing where files live.",
      },
    ],
  },

  {
    slug: "server-actions",
    title: "Server actions",
    summary: "Form handling where CSRF verification is structural, not a decorator.",
    blocks: [
      {
        kind: "p",
        text: "Any exported HTTP method handler under routes/api/ is a server action. By the time it runs, the framework has already verified the CSRF token.",
      },
      {
        kind: "code",
        label: "routes/api/subscribe.ts",
        text: `import type { ActionContext } from "stoneware";

export async function POST({ request }: ActionContext) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");

  return Response.json({ ok: true });
}`,
      },
      { kind: "h2", text: "Forms" },
      {
        kind: "p",
        text: "Use the Form helper instead of a raw form element and the hidden token field is injected for you.",
      },
      {
        kind: "code",
        label: "routes/index.tsx",
        text: `import { Form } from "stoneware";

<Form action="/api/subscribe">
  <input type="email" name="email" required />
  <button type="submit">Subscribe</button>
</Form>;`,
      },
      {
        kind: "p",
        text: "Verification happens in the request pipeline, before any handler is reached, on every non-GET request. It is not something a route opts into — a raw form does not silently skip protection, it simply fails. The token is checked against a clone of the request, so your handler still receives an unconsumed body.",
      },
      {
        kind: "p",
        text: "For an island doing its own fetch(), pass the token in as a prop with csrfToken() and send it in the x-csrf-token header.",
      },
    ],
  },

  {
    slug: "security",
    title: "Security defaults",
    summary: "What is on before you configure anything, and why it cannot be off by accident.",
    blocks: [
      {
        kind: "p",
        text: "Every security-relevant default is safe with an empty config object. Weakening one requires naming it explicitly; there is no path to an insecure setup by omission.",
      },
      { kind: "h2", text: "Escaping" },
      {
        kind: "p",
        text: "Every interpolated value passes through Bun.escapeHTML() on the way out. Not by convention and not by lint rule — by the renderer, with no global switch to turn it off.",
      },
      {
        kind: "code",
        text: `<p>{userInput}</p>           // always escaped
<p>{raw("<em>ok</em>")}</p>  // the only way through`,
      },
      {
        kind: "p",
        text: "raw() is deliberately more effort than the safe path, and greppable during review. dangerouslySetInnerHTML works too, on both the server and the client, and is named the way it is for the same reason — both hand the browser markup you vouched for.",
      },
      {
        kind: "p",
        text: "Three things the renderer refuses outright, because escaping cannot make them safe: interpolating dynamic values into a script or style body, attribute names that could break out of a tag, and a javascript: or vbscript: URL in an attribute the browser follows.",
      },
      {
        kind: "code",
        text: `<a href={userSupplied}>          // refused if the scheme executes
<div onclick={fromASpread}>      // dropped, in any casing`,
      },
      {
        kind: "quote",
        text: "The server and the client share one module deciding this. They used to decide separately and drifted once — the handler check was tightened in the renderer and left alone in the client, so an island was guarded on first paint and unguarded on every update after it. A shared policy makes that class of bug impossible rather than merely unlikely.",
      },
      { kind: "h2", text: "Content-Security-Policy" },
      {
        kind: "p",
        text: "A restrictive policy ships by default: script-src 'self', no unsafe-inline, no unsafe-eval. Stoneware never emits inline executable script, so no nonce plumbing is needed to satisfy it.",
      },
      {
        kind: "quote",
        text: "This documentation site runs under that default policy, unmodified. The dev server serves its live-reload client as a real file rather than an inline script, so development and production run the same policy.",
      },
      {
        kind: "p",
        text: "One consequence worth knowing: style-src 'self' blocks inline style attributes too. Islands that need to drive a value at runtime write a CSS custom property through the CSSOM, which CSP does not govern. The scroll gauge on this page works that way.",
      },
      {
        kind: "p",
        text: "Since 0.1.4 the renderer says so rather than leaving you to find it. The attribute is still emitted — a warning must not change output, and the project may be about to widen its policy — but development prints a line naming the element, and stays quiet if the policy allows unsafe-inline or sets no style-src at all.",
      },
      {
        kind: "code",
        language: "txt",
        label: "development",
        text: `[stoneware] <p style="..."> will be ignored by the browser.
  The Content-Security-Policy sets style-src without 'unsafe-inline', which
  blocks style attributes as well as <style> blocks. The markup renders, the
  declaration is in the HTML, and it simply never applies.
  Use a class and a .css file beside the component - the build collects it.`,
      },

      { kind: "h2", text: "The policy after a static export" },
      {
        kind: "p",
        text: "A CSP is a response header, so a directory of files cannot carry one. Until 0.1.4 that made the claim above false for stoneware export: the pages went out with no policy at all unless the host was configured to send one, and nothing indicated the loss.",
      },
      {
        kind: "p",
        text: "An export now writes both a _headers file — read by Netlify and Cloudflare Pages, carrying the full policy and the other security headers — and a meta http-equiv tag in every page, which works on any host including GitHub Pages. Neither covers everything alone.",
      },
      {
        kind: "quote",
        text: "frame-ancestors, report-uri and sandbox are ignored by browsers when they arrive in a meta tag. They are stripped from it rather than emitted, because a policy that lists frame-ancestors without enforcing it advertises clickjacking protection the page does not have. The export names them at the end of the run, so what a header-less host gives up is stated rather than assumed.",
      },
      { kind: "h2", text: "Rotating the CSRF secret" },
      {
        kind: "p",
        text: "STONEWARE_CSRF_SECRET signs every token. Replacing it invalidates all of them at once, which is what you want if it has leaked — or on a schedule, if you rotate secrets as a matter of course.",
      },
      {
        kind: "code",
        language: "sh",
        label: "terminal",
        text: `# Generate a new one
bun -e 'console.log(crypto.randomUUID() + crypto.randomUUID())'

# Set it wherever the app reads its environment, then restart.
# Render, Railway, Fly: the dashboard. Docker: the compose file. Local: .env`,
      },
      {
        kind: "p",
        text: "The cost is one round of failed submissions: any form already rendered in a visitor's browser carries a token signed with the old secret and will be rejected. They see the CSRF error and succeed on a reload. There is no rolling window that accepts both, deliberately — accepting an old secret after a rotation is the one thing a rotation is supposed to stop.",
      },
      {
        kind: "list",
        items: [
          "Rotate on leak, on staff changes, or on a schedule you set. Nothing expires it automatically.",
          "A production build refuses to start without one rather than falling back to something that appears to work.",
          "Tokens carry their own expiry too — 24 hours by default, adjustable with csrf.expiresIn.",
        ],
      },
      {
        kind: "quote",
        text: "Tokens are signed with this secret and bound to nothing else. Same-origin policy is what stops an attacker reading one out of your pages; the token proves the request came from a page your server rendered, not that it came from a particular visitor.",
      },

      { kind: "h2", text: "Everything else" },
      {
        kind: "list",
        items: [
          "Hydration payloads are JSON in a non-executable block, with <, >, & and U+2028/9 escaped.",
          "X-Content-Type-Options, X-Frame-Options and Referrer-Policy on every response.",
          "Static file serving refuses path traversal.",
          "A production build refuses to start without a CSRF secret.",
        ],
      },
      {
        kind: "p",
        text: "Every response leaves through a single function that applies these headers, so a new route cannot forget them.",
      },
    ],
  },

  {
    slug: "cli",
    title: "CLI and builds",
    summary: "Dev server, production build, and what each command actually emits.",
    blocks: [
      {
        kind: "code",
        language: "sh",
        label: "terminal",
        text: `stoneware dev      # dev server with hot reload
stoneware build    # production build
stoneware start    # run the production server bundle
stoneware export   # prerender every page to static HTML

stoneware preview  # serve an export the way a static host would
stoneware routes   # print the route table, in match order
stoneware doctor   # check the project setup

stoneware --version   # both versions, for a bug report`,
      },
      { kind: "h2", text: "Development" },
      {
        kind: "p",
        text: "One process serves pages, built island chunks, and the live-reload socket. There is no second dev server and no proxy. Editing a file under routes/, islands/ or lib/ rebuilds and reloads the browser.",
      },

      {
        kind: "p",
        text: "If the port is already taken, dev moves to the next free one and says so — a busy port in development is nearly always your own previous run. Production does the opposite and fails loudly, because a platform routes traffic to the port it assigned and quietly binding a different one produces a service that looks healthy in its own logs while every request from outside fails.",
      },
      {
        kind: "p",
        text: "Dev also asks whether anything is already answering on the port before it binds, rather than only reacting to a failed bind. The case that needed it: dev binds localhost and start binds 0.0.0.0, which are different sockets, so two projects could each hold :3000 with neither seeing an error — and requests went to whichever one the client's IPv4/IPv6 preference picked.",
      },
      {
        kind: "code",
        language: "sh",
        label: "terminal",
        text: `$ stoneware dev --port 3000 --open

[stoneware] something is already serving on port 3000, trying 3001
[stoneware] dev server on http://localhost:3001`,
      },
      {
        kind: "p",
        text: "--open launches a browser at the served URL. Only on a first start, never on a hot reload — the dev server re-evaluates its own module on every save, so opening unconditionally would spawn a tab per keystroke.",
      },

      { kind: "h2", text: "When something breaks" },
      {
        kind: "p",
        text: "A failed rebuild appears in the browser, not only in the terminal. Without that, a build error leaves the page serving stale output with nothing to indicate it — and the only notice is a line in a window you may not be looking at.",
      },
      {
        kind: "code",
        language: "txt",
        label: "the overlay",
        text: `Build failed

islands/Counter.tsx:3:10
  Expected "}" but found "null"

    return null;
            ^`,
      },
      {
        kind: "p",
        text: "It clears on the next successful build. A thrown route gets the same treatment on the server side: the built-in 500 page renders the stack in development, so the thing you need is in front of you. Production shows neither the message nor the stack.",
      },
      {
        kind: "quote",
        text: "Both respect the default CSP. The overlay styles itself through the CSSOM, which the policy does not govern, and the error page is deliberately unstyled — relaxing style-src to prettify an error would mean developing against a policy production does not use.",
      },
      {
        kind: "p",
        text: "Bun.build rejects with an AggregateError whose own message is the unhelpful string \"Bundle failed\"; everything useful — file, line, column, source text — is on the messages inside it. The dev server unpacks that rather than forwarding the summary.",
      },
      { kind: "h2", text: "Production" },
      {
        kind: "list",
        items: [
          "One server bundle, with every route and island statically imported so no transpilation happens per request.",
          "One content-hashed client chunk per island, plus a shared runtime chunk.",
          "One content-hashed stylesheet, collected from every .css under routes/, islands/ and lib/.",
          "An island manifest, so the server serves pre-built chunks instead of rebuilding at boot.",
        ],
      },
      {
        kind: "quote",
        text: "On 0.1.3 and earlier, route modules are inlined into the server bundle but path matching still uses Bun.FileSystemRouter, so routes/ must exist at runtime. From 0.1.4 the build writes a pattern table instead and the source tree is no longer needed to serve.",
      },
      {
        kind: "code",
        language: "sh",
        label: "terminal",
        text: `$ stoneware build

[stoneware] build complete in 156ms
  server   .stoneware/server.js
  routes   4
  islands  3
             Counter              247 B
             Badge                191 B
             @runtime             45 B
             total                483 B`,
      },
      {
        kind: "p",
        text: "Sizes are reported per island. JavaScript being opt-in is only a claim you can check if the cost is shown next to the name of the thing that caused it.",
      },

      { kind: "h2", text: "What gets minified, and what deliberately does not" },
      {
        kind: "figure",
        label: "production output",
        text: `                 minified          source maps
  ──────────────────────────────────────────────────
  island chunks  fully             none
  stylesheet     fully             —
  server bundle  whitespace only   emitted and linked`,
      },
      {
        kind: "p",
        text: "The two are treated differently because the questions are different. An island chunk is downloaded by every visitor and never read from a stack trace, so every byte counts and identifiers do not. The server bundle is downloaded by nobody and read from stack traces whenever something breaks in production, so the reverse holds.",
      },
      {
        kind: "figure",
        label: "the same throwing route, built four ways",
        text: `  none          270 KB   at Boom (routes/boom.tsx:3:14)
  whitespace    221 KB   at Boom (routes/boom.tsx:3:14)
  + syntax      213 KB   at Boom (routes/boom.tsx:2:22)
  + identifiers 199 KB   at e8   (routes/boom.tsx:2:22)`,
      },
      {
        kind: "p",
        text: "Stripping whitespace is free: 18% off with the frame, line, column and error text all identical to an unminified build. Past that, syntax minification constant-folds — which moved the reported line and rewrote the message from value.missingProperty to null.missingProperty, pointing at the wrong thing — and identifier mangling turns the frame into e8. Source maps recover neither, so the last 10% is not taken.",
      },

      { kind: "h2", text: "Seeing the route table" },
      {
        kind: "p",
        text: "Nothing about two filenames says which one a request reaches first. stoneware routes prints the compiled table in the order patterns are actually tried — literal before dynamic before catch-all — along with whether each is a page or a server action.",
      },
      {
        kind: "code",
        language: "sh",
        label: "terminal",
        text: `$ stoneware routes

  /api/echo     POST     routes/api/echo.ts
  /blog/[slug]  GET      routes/blog/[slug].tsx
  /plain        GET      routes/plain.tsx
  /             GET      routes/index.tsx

  4 route(s), listed in match order.`,
      },
      {
        kind: "p",
        text: "Reserved routes — _404, _500, _middleware — are listed rather than hidden. They are real files doing real work, and leaving them out invites the conclusion that they were not picked up. A module that fails to import is reported as unknown instead of taking the listing down: a route list is most useful precisely when something is broken.",
      },

      { kind: "h2", text: "Checking the setup" },
      {
        kind: "p",
        text: "stoneware doctor checks the things a running server cannot check for you. A missing CSRF secret already stops production from starting with a message that names it, so doctor does not re-check it; what it covers is the class of problem that surfaces later as something apparently unrelated.",
      },
      {
        kind: "code",
        language: "sh",
        label: "terminal",
        text: `$ stoneware doctor

  ok    Bun 1.3.14
  ok    stoneware 0.1.5
  FAIL  tsconfig compilerOptions.jsxImportSource is "react", expected "stoneware"
        JSX will compile against React's runtime. This does not fail at build
        time - it fails mid-render as a TypeError about an object, pointing at
        a template that is fine.
  ok    routes/ with an index route
  warn  .gitignore does not cover .env

  1 error(s), 1 warning(s).`,
      },
      {
        kind: "p",
        text: "It exits non-zero on an error so it is usable in CI, and zero on a warning — failing a pipeline over a judgement call teaches people to stop running it.",
      },

      { kind: "h2", text: "Static export" },
      {
        kind: "p",
        text: "stoneware export prerenders every page to a directory of plain HTML files. It builds first, then fetches each route through the ordinary request pipeline — the same router, the same renderer — so what lands on disk is what the server would have sent, with one deliberate addition covered below. There is no second rendering path to drift.",
      },
      {
        kind: "code",
        language: "sh",
        label: "terminal",
        text: `$ stoneware export --out dist

[stoneware] exported 12 page(s) in 486ms
  output   /srv/my-site/dist
  skipped  /subscribe (renders a CSRF token)
  csp      embedded in every page, and written to _headers
           frame-ancestors 'none' needs a real header —
           _headers covers Netlify and Cloudflare Pages, other hosts need config`,
      },
      {
        kind: "p",
        text: "The output has no runtime requirement at all, which is the point: it deploys to Cloudflare Pages, Netlify, GitHub Pages or any CDN — hosts that cannot run Bun and so cannot run a Stoneware server.",
      },

      { kind: "h2", text: "The policy an exported site carries" },
      {
        kind: "p",
        text: "A Content-Security-Policy is a response header, and a directory of files cannot carry one. Before 0.1.4 that meant an exported site had no policy at all until the host was configured to send it — the framework's strongest default, silently absent, with nothing to indicate it.",
      },
      {
        kind: "figure",
        label: "what each mechanism covers",
        text: `  stoneware start     header          everything, frame-ancestors included

  export → _headers   header          everything, on hosts that read the file
                                      (Netlify, Cloudflare Pages)

  export → <meta>     in the markup   everything except frame-ancestors,
                                      report-uri and sandbox`,
      },
      {
        kind: "p",
        text: "Both are written, because neither is sufficient alone. _headers is inert on a host that does not read it; a meta tag works anywhere, including GitHub Pages, but browsers ignore three directives when they arrive that way. Those three are stripped from the tag rather than emitted, because a policy that lists frame-ancestors and does not enforce it advertises protection the page does not have.",
      },
      {
        kind: "quote",
        text: "So on Netlify and Cloudflare Pages an export is protected exactly as the server would protect it. Anywhere without header support you keep everything except clickjacking protection, and the export names what is missing rather than reporting parity.",
      },
      {
        kind: "p",
        text: "The meta tag is placed after any charset declaration and before the first stylesheet, preload or script. Both constraints are real: a charset has to land within the first 1024 bytes, and a meta policy only governs what is declared after it.",
      },

      { kind: "h2", text: "Environment" },
      {
        kind: "p",
        text: "Bun reads .env natively, so Stoneware has no dotenv dependency. create-stoneware generates a .env with a unique STONEWARE_CSRF_SECRET and gitignores it, leaving .env.example as the tracked template. A real environment variable beats .env.local, which beats .env.",
      },
    ],
  },

  {
    slug: "deploying",
    title: "Deploying",
    summary: "What a host has to provide, which platforms qualify, and the one file you add.",
    blocks: [
      {
        kind: "p",
        text: "A Stoneware app is a Bun HTTP server. Deploying it means running one file on a host that has Bun — there is no adapter layer and no per-platform build target.",
      },

      { kind: "h2", text: "What the host must provide" },
      {
        kind: "list",
        items: [
          "The Bun runtime. Not Node, not a V8 isolate — the framework is built on Bun.serve, Bun.CSRF and Bun.escapeHTML.",
          ".stoneware/ from the build: the server bundle, the island manifest and the island chunks.",
          "public/, if the app serves static assets.",
          "routes/ and islands/, on disk, at request time — on 0.1.3 and earlier. Path matching reads the filenames on every request, and the island registry is rebuilt from the sources at boot.",
          ".stoneware/islands.json reachable by whatever packages your function — on 0.1.4. Inlined into the bundle from 0.1.5, so it no longer has to travel as a file.",
        ],
      },
      {
        kind: "quote",
        text: "Since 0.1.4, routes/ and islands/ are not on that list. A build inlines every route and island into the bundle and writes a pattern table beside it, so the source tree becomes a build-time input rather than a runtime dependency. On 0.1.3 and earlier, both directories must be present at request time.",
      },
      {
        kind: "p",
        text: "That matters wherever the machine that builds is not the machine that serves — a container image, a serverless function, a CI artifact. The build resolves its own project root from the bundle's location rather than recording the path it was built at, so the output runs wherever it is unpacked.",
      },

      { kind: "h2", text: "Starting the server" },
      {
        kind: "p",
        text: "You do not write an entry point. stoneware build emits one, and stoneware start runs it — that is the whole deploy on any host that can run Bun.",
      },
      {
        kind: "code",
        language: "sh",
        label: "deploy",
        text: `bun install
stoneware build      # writes .stoneware/
stoneware start      # serves .stoneware/server.js`,
      },
      {
        kind: "quote",
        text: "Earlier versions of this page told you to hand-write a server.ts calling createApp(config, { dev: false }). Do not. With no root in the config, that resolves paths against process.cwd(), which is the project directory when you run it locally and something else entirely inside a container or a serverless function — so it starts, finds no routes/ and no island manifest, and crashes before the first request. The generated bundle derives its root from its own location instead.",
      },
      {
        kind: "p",
        text: "If you genuinely need a custom entry point — extra middleware around the app, a second port, a health probe outside the router — pass root explicitly rather than letting it default.",
      },
      {
        kind: "code",
        label: "server.ts — only if you need one",
        text: `import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "stoneware";
import config from "./stoneware.config.ts";

// From this file's own location, never process.cwd(): the directory a build
// ran in is routinely not the directory it is served from.
const root = dirname(fileURLToPath(import.meta.url));

// dev: false reads the island manifest that \`stoneware build\` wrote, rather
// than rebuilding chunks (and changing their hashed filenames) on every start.
const app = await createApp({ ...config, root }, { dev: false });

Bun.serve({
  port: Number(Bun.env.PORT ?? 3000),
  // Bun.serve defaults to localhost, which is loopback-only. Every container
  // runtime reaches the process through a proxy on another interface, so
  // binding localhost makes the service unreachable and health checks fail.
  hostname: Bun.env.HOST ?? "0.0.0.0",
  fetch: (request) => app.fetch(request),
});`,
      },

      { kind: "h2", text: "Behind a proxy that terminates TLS" },
      {
        kind: "p",
        text: "Render, Railway, Fly, Heroku, Vercel and nginx all terminate TLS and forward a plain HTTP request. Without being told, the app sees http:// on a site served over https://, and every absolute URL it builds — canonical links, og:image, sitemap entries — points at the insecure origin.",
      },
      {
        kind: "code",
        label: "stoneware.config.ts",
        text: `export default defineConfig({
  trustProxy: "proto",   // or true, or STONEWARE_TRUST_PROXY in the environment
});`,
      },
      {
        kind: "list",
        items: [
          "\"proto\" trusts X-Forwarded-Proto only. Safe on any host, and enough to fix http/https confusion, which is the case that actually bites.",
          "true also trusts X-Forwarded-Host. A forged host poisons every absolute URL the app emits, so use it only when something you control sets that header.",
          "Off by default, because these headers are trivially forged by anyone who can reach the app directly.",
        ],
      },
      {
        kind: "quote",
        text: "This is a real bug this site shipped: every page declared <link rel=\"canonical\" href=\"http://...\"> while being served over https, which tells Google the insecure copy is the authoritative one.",
      },

      { kind: "h2", text: "Which platforms work" },
      {
        kind: "figure",
        label: "the runtime decides, not the framework",
        text: `                      runs Bun?   ships whole dir?
  VPS / Docker            yes           yes        works as-is
  Fly.io                  yes           yes        works as-is
  Railway / Render        yes           yes        works as-is

  Vercel                  yes           no         build --target vercel

  Netlify / Cloudflare     no           -          wrong runtime
  GitHub Pages, any CDN    no           -          no runtime at all
                                                   -> stoneware export`,
      },
      {
        kind: "p",
        text: "Anywhere you can run bun server.ts against the project directory, nothing extra is required — the directory is simply there. The second column is what a bundling platform makes hard, and it is the column 0.1.4 removed: once the build is relocatable, only the runtime question is left. Cloudflare Workers run V8 isolates and Netlify Functions run Node, so neither can host a Stoneware server — for those, prerender the site instead.",
      },

      { kind: "h2", text: "Static export" },
      {
        kind: "p",
        text: "stoneware export writes the whole site to a directory of plain files, which removes the runtime requirement entirely. Every page is fetched through the ordinary request pipeline rather than a second rendering path, so the HTML on disk is byte-identical to what the server would have sent.",
      },
      {
        kind: "code",
        language: "sh",
        label: "terminal",
        text: `stoneware export --out dist`,
      },
      {
        kind: "figure",
        label: "dist/",
        text: `dist/
├── index.html                 <- routes/index.tsx
├── 404.html                   <- routes/_404.tsx, if you have one
├── docs/
│   ├── index.html             <- routes/docs/index.tsx
│   └── routing/index.html     <- routes/docs/[slug].tsx
├── _stoneware/                island chunks + the hashed stylesheet
└── mark.svg                   everything from public/`,
      },
      {
        kind: "p",
        text: "A page is written as <path>/index.html rather than <path>.html, so a static host serves it at the URL the dev server used — no trailing-slash redirect and no per-host rewrite rules to write.",
      },
      {
        kind: "p",
        text: "The 404 page is the exception, because it has no URL of its own. It is produced by requesting a path that cannot match and written to 404.html, which is the filename Cloudflare Pages, Netlify and GitHub Pages each serve for a miss.",
      },
      {
        kind: "p",
        text: "A route with [params] cannot be enumerated on its own. Export it by having the module say which pages exist; without staticPaths the route is skipped and named in the summary rather than guessed at.",
      },
      {
        kind: "code",
        label: "routes/docs/[slug].tsx",
        text: `export function staticPaths() {
  return DOCS.map((page) => ({ slug: page.slug }));
}`,
      },
      {
        kind: "quote",
        text: "Two things are never written: server actions, which have no GET, and any page that renders a CSRF token. A prerendered token would be frozen into the file and handed to every visitor, and one token for everyone is no protection at all. Both are reported at the end of the run, so the omission is visible rather than silent.",
      },
      {
        kind: "p",
        text: "That last rule is also the boundary of the technique. A form backed by a server action needs a running server; export covers the pages around it, not the action itself. A fully static site is one with no mutating requests.",
      },

      { kind: "h2", text: "Vercel" },
      {
        kind: "p",
        text: "Vercel runs Bun as a first-class function runtime. Its Bun framework preset detects a single Bun.serve() call in a root server.ts and routes every request through it, so no /api directory and no routing configuration are needed. The preset requires a bun.lock file to be present.",
      },
      {
        kind: "p",
        text: "stoneware build --target vercel writes both pieces the preset looks for: a root server.js that imports the built bundle, and a vercel.json if the project has none. An existing vercel.json is never rewritten — it is hand-maintained configuration that may carry regions, headers or redirects — so anything missing from it is reported instead.",
      },
      {
        kind: "quote",
        text: "On 0.1.3 and earlier you could write these two files by hand and the deploy still 404'd: the bundle recorded its build path and rescanned routes/, so the function started and matched nothing. The target and the fix shipped together in 0.1.4, which is why upgrading is the answer rather than more configuration.",
      },
      {
        kind: "code",
        language: "sh",
        label: "terminal",
        text: `stoneware build --target vercel`,
      },
      {
        kind: "code",
        language: "txt",
        label: "vercel.json",
        text: `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "bun",
  "bunVersion": "1.x",
  "buildCommand": "bun node_modules/stoneware/bin/stoneware.mjs build --target vercel"
}`,
      },
      {
        kind: "code",
        label: "server.js — generated, do not edit",
        text: `import "./.stoneware/server.js";`,
      },
      {
        kind: "p",
        text: "A side-effect import, deliberately. The bundle calls Bun.serve() as it evaluates, and that call is exactly what the preset detects. Exporting a handler instead would leave the server unstarted and every request unrouted.",
      },
      {
        kind: "quote",
        text: 'framework: "bun" is the line that matters. Left as "Other", Vercel treats the project as a static build: server.ts is never detected, no function is created, and every path returns 404: NOT_FOUND — even though the build log reports success. Setting it in vercel.json overrides Project Settings, so it is version-controlled rather than a dashboard click someone has to remember.',
      },
      {
        kind: "list",
        items: [
          "buildCommand invokes the CLI through Bun directly, which sidesteps shim and shebang resolution in the build image.",
          "Set STONEWARE_CSRF_SECRET as a project environment variable.",
          "If the app lives in a subdirectory of a larger repo, set Root Directory to it — Vercel still clones the whole repository and only changes directory into it.",
        ],
      },
      {
        kind: "quote",
        text: 'Do not add a functions block for the preset. Those patterns only match Serverless Functions inside an api/ directory, so the build fails with "The pattern server.ts doesn\'t match any Serverless Functions inside the api directory." There is no includeFiles equivalent for the framework preset.',
      },
      {
        kind: "p",
        text: "On 0.1.5 the function carries what it needs. If one still crashes, the remaining suspect is .stoneware/ itself. A serverless filesystem is read-only outside /tmp, so a missing island manifest used to make the server fall back to rebuilding chunks, and that write failed in a way that looked unrelated to the cause. It now fails immediately with a message naming the directory instead.",
      },
      {
        kind: "quote",
        text: "On 0.1.3 and earlier the usual failure is different and quieter: the bundle records the absolute path it was built at and rescans routes/ on every request, so a function that starts perfectly well answers 404 for every path. Fixed in 0.1.4 rather than worked around, so upgrading is the answer rather than the /api model.",
      },

      { kind: "h2", text: "When a serverless deploy crashes" },
      {
        kind: "p",
        text: "A bundled function that starts without its files fails at startup, and the platform reports a generic 500. Check the function log rather than the page: the cause is a missing directory nearly every time, and the log names it.",
      },
      {
        kind: "p",
        text: "Guarding for it explicitly turns an opaque crash into a readable one, which is worth the six lines on any host that bundles.",
      },
      {
        kind: "code",
        label: "server.ts — optional preflight",
        text: `import { existsSync } from "node:fs";
import { resolve } from "node:path";

if (!existsSync(resolve(process.cwd(), ".stoneware/islands.json"))) {
  console.error(
    \`[stoneware] missing .stoneware/ in \${process.cwd()} — \` +
      "the build output did not reach the runtime",
  );
}`,
      },
    ],
  },

  {
    slug: "whats-new",
    title: "What's new",
    summary: "0.1.6 — error boundaries, a request hook, a request path about three times faster, and a dev server that stops breaking itself.",
    blocks: [
      { kind: "h2", text: "0.1.6" },
      {
        kind: "p",
        text: "Not published yet. npm still installs 0.1.5, which is what this site runs on. Everything below is in the repository with tests behind it, and this page becomes the release note when it ships.",
      },

      { kind: "h2", text: "One widget can fail without taking the page" },
      {
        kind: "figure",
        label: "a component throws mid-page",
        text: `  before                          now
  ──────────────────────────      ──────────────────────────
  500 — the whole page            200 — the page intact,
  unwinds to _500.tsx             a short note where the
                                  widget was
  a malformed row in one
  widget costs the article        and the error still
  around it                       reaches your logs`,
      },
      {
        kind: "code",
        language: "tsx",
        label: "the whole API",
        text: `import { Boundary } from "stoneware";

<Boundary fallback={<p>Reviews are unavailable right now.</p>}>
  <Reviews productId={product.id} />
</Boundary>`,
      },
      {
        kind: "p",
        text: "Server-side only, and cheap for a reason: rendering is one synchronous walk to a string, so catching is a try around a subtree. No error state, nothing to reset, no second pass, and no JavaScript shipped. See error boundaries.",
      },
      {
        kind: "p",
        text: "notFound() is deliberately not caught — it is a routing decision travelling as an exception, and swallowing it would render a fallback with a 200. And a caught error is never silent: it goes to the console always, and onto the request's observe event as event.caught, so a degraded page is one you know about rather than one that merely looks fine.",
      },
      {
        kind: "quote",
        text: "It survived the measurement that killed a bigger idea. Rewriting the renderer to append into a shared buffer would have made a discarded subtree need an offset and a truncate; because it returns strings up the tree instead, a subtree that throws has simply produced nothing yet. The rewrite was measured, found worthless, and not made — which is why this one is small.",
      },

      { kind: "h2", text: "One hook that sees every request" },
      {
        kind: "figure",
        label: "what a request log could tell you",
        text: `  before                          now
  ──────────────────────────      ──────────────────────────
  nothing, unless you wrote       one line, from one config
  it into _middleware.ts          key, on every request

  and middleware runs before      200 GET /blog/hello-world
  matching, so the most it          1.1ms  /blog/[slug]
  could ever report was the
  path that was asked for         the pattern, not the path`,
      },
      {
        kind: "code",
        language: "ts",
        label: "stoneware.config.ts",
        text: `import { defineConfig, consoleObserver } from "stoneware";

export default defineConfig({
  observe: consoleObserver(),
});`,
      },
      {
        kind: "p",
        text: "stoneware dev installs that observer for you, so development prints a line per request with no configuration. Production installs nothing until you ask — a server that narrates itself by default is a server whose logs you turn off.",
      },
      {
        kind: "p",
        text: "The field that makes this worth building into the framework rather than leaving to you is route: the matched pattern, /blog/[slug], not the path that was requested. That is what you group by — one row per route instead of one row per blog post — and middleware cannot produce it, because middleware runs before matching. kind is the same argument: only the pipeline knows whether a 404 came from an unmatched path or from a page that called notFound(), and only it can tell a CSRF rejection apart from an application error.",
      },
      {
        kind: "figure",
        label: "event.kind",
        text: `  page         a route rendered HTML, notFound() included
  action       an HTTP method handler under routes/
  asset        public/ or a built island chunk
  not-found    nothing matched the path
  middleware   _middleware.ts answered instead of the route
  preflight    a CORS OPTIONS, answered before anything else
  rejected     CSRF verification refused it
  error        something threw and reached the exit point`,
      },
      {
        kind: "p",
        text: "rejected is deliberately not error. A rise in CSRF rejections is a security signal — a stale form, a misconfigured proxy, or somebody trying — and averaging it into the 5xx rate hides all three.",
      },
      {
        kind: "code",
        language: "ts",
        label: "sending it somewhere other than the console",
        text: `observe: (event) => {
  metrics.timing("http.request", event.durationMs, {
    route: event.route ?? "unmatched",
    kind: event.kind,
    status: String(event.status),
  });
  if (event.error) Sentry.captureException(event.error);
},`,
      },

      { kind: "h2", text: "What an observer cannot do" },
      {
        kind: "p",
        text: "It is handed a finished response and its return value is discarded. See everything, change nothing — for the same reason middleware has no next(): the security headers are applied at a single exit point, and a hook that could rewrite what has already been assembled could remove them.",
      },
      {
        kind: "list",
        items: [
          "An observer that throws is reported once per process and the request is served normally. A broken logger must not be able to turn a 200 into a 500.",
          "An async one is accepted and never awaited, so no response inherits the latency of a metrics backend. A rejected promise is reported rather than left unhandled.",
          "stoneware export suppresses it. An export prerenders by fetching through the ordinary pipeline, but nobody is visiting — without this, every build would send a burst of synthetic traffic indistinguishable from the real thing.",
        ],
      },
      {
        kind: "quote",
        text: "The event carries the full URL, query string included. That is where personal data ends up when it ends up anywhere, so strip what you must before forwarding it off the box.",
      },

      { kind: "h2", text: "Your configuration now travels with the build" },
      {
        kind: "figure",
        label: "the same mistake, a third time",
        text: `  0.1.4    routes/ rescanned at runtime
  0.1.5    islands.json read at runtime
  0.1.6    stoneware.config.ts imported at runtime

  every one of them a path assembled while
  running, which import tracing cannot see`,
      },
      {
        kind: "p",
        text: "The built server loaded your config by building a path from the project root and importing it. Same shape as the two failures before it, and found only because observe is a function — nothing serialised could have carried one, which forced a look at how the config reaches the bundle at all.",
      },
      {
        kind: "p",
        text: "This one fails worse than the others, because nothing throws. A config file that is not there is indistinguishable from a project that has none, so the app comes up on defaults: your csp override, cors, trustProxy and observer all silently absent. If your config is where your CSRF secret comes from, it is worse still — the server refuses to start, and the message names the secret rather than the missing file.",
      },
      {
        kind: "p",
        text: "The build now writes a static import of stoneware.config.ts into the generated entry, so the bundler inlines it exactly like your routes. Verified the way the last two were: build, move the output, delete routes/, islands/, islands.json and the config itself, then serve from a different directory. A container or VPS that ships the whole directory was never affected by any of the three.",
      },

      { kind: "h2", text: "Editing an island no longer breaks the dev server" },
      {
        kind: "figure",
        label: "save a file under islands/, then reload the page",
        text: `  before                          now
  ──────────────────────────      ──────────────────────────
  500 on any page with a          200, with the edit applied
  Form, blaming the
  template rather than            one server, one port, for
  the reload                      the life of the process

  plus a second server on         live-reload sockets stay
  the next port — the only        open across the swap
  one that actually works`,
      },
      {
        kind: "p",
        text: "The dev server called Bun.serve again on every hot re-evaluation. The previous one stayed bound, the new one took the next free port, and the browser carried on talking to a server built from the previous module graph. Editing anything under islands/ triggers that re-evaluation, because island modules are imported through the framework's own graph.",
      },
      {
        kind: "p",
        text: "Once two graphs were live, every identity check the framework makes started failing across them. csrfToken() read an AsyncLocalStorage the running server had never written to, so any page with a <Form> answered 500 — and the error named the template rather than the reload. Each further edit stranded another server on another port.",
      },
      {
        kind: "p",
        text: "There is now one server for the life of the process, handed a new request handler on each re-evaluation rather than binding again. Same port, one live module graph, and the live-reload connections stay open across the swap instead of reconnecting.",
      },
      {
        kind: "quote",
        text: "This bug is as old as the dev server and cost a restart every time it fired. It went unnoticed because nothing logged it — which is what the request hook above, added in the same release, is for. The first thing it printed was the 500 nobody had seen.",
      },

      { kind: "h2", text: "The dev server rebuilds only what changed" },
      {
        kind: "figure",
        label: "time spent rebuilding after one save",
        text: `  what you edited                 rebuild cost
  ──────────────────────────      ──────────────────────────
  a template (.tsx)               53 ms  ->  0.1 ms
  a file in public/               53 ms  ->  0.0 ms
  a stylesheet                    53 ms  ->   10 ms
  an island or lib/               53 ms  ->   50 ms`,
      },
      {
        kind: "p",
        text: "Every file change redid all of it: re-import every island, re-bundle every client chunk, re-emit the stylesheet. Editing a template invalidates none of that. Each watched directory now declares what it can actually invalidate — routes/ re-imports templates and only builds a .css, islands/ and lib/ are bundled into chunks, public/ is served as-is and builds nothing.",
      },
      {
        kind: "p",
        text: "Measured on a fixture with two islands, so the saving grows with the number you have. Rebuilding the stylesheet is never skipped when the islands rebuild: building the chunks clears the static directory, and a stylesheet left behind would simply be gone.",
      },

      { kind: "h2", text: "A faster request path" },
      {
        kind: "figure",
        label: "server time for one page request, same page and machine",
        text: `  0.1.5   ~300 us
  0.1.6    ~80 us

  nothing about the framework's shape changed —
  this is work that was being repeated per request
  and is now done once, or not at all`,
      },
      {
        kind: "list",
        items: [
          "Every request that reached the router first asked the filesystem whether the path was a static file, and got its answer by catching an exception. Checking existence before resolving links removes a thrown error from the page path — the single largest item, worth roughly 95us here.",
          "Tag and attribute names are now classified once and remembered instead of re-derived per occurrence. A 58 kB page renders about 28% faster; attribute-heavy markup about 39%.",
          "Route matching is flat rather than linear. At 300 routes it cost 9us per request and now costs 1.1us, because literal paths are looked up rather than scanned.",
          "The resolved form of a served directory is worked out once per process rather than once per request, and params are allocated only when a route actually captures one.",
        ],
      },
      {
        kind: "quote",
        text: "Absolute numbers are from Windows, where filesystem syscalls and exceptions are expensive. The shape of each win holds everywhere; the size does not. Every one of these was measured before and after rather than reasoned about — and one change that looked obviously worthwhile on paper, rewriting the renderer to append into a shared buffer, turned out to be worth nothing and was not made.",
      },

      { kind: "h2", text: "Also in 0.1.6" },
      {
        kind: "list",
        items: [
          "consoleObserver skips assets by default. One page load is one page request and then every image, stylesheet and island chunk on it; consoleObserver({ assets: true }) includes them.",
          "Durations are reported as a float, not a rounded integer. A static render is routinely faster than a millisecond, and rounding would print 0ms for the path the framework exists to make fast.",
          "formatEvent is exported, so you can keep the one-line format while sending it somewhere other than the console.",
          "stoneware export no longer fires your observer. An export prerenders by fetching through the ordinary pipeline, but nobody is visiting — without this, every build sent a burst of synthetic traffic indistinguishable from the real thing.",
          "The server bundle has its whitespace stripped: 18% smaller, at no build-time cost. Island chunks and the stylesheet were already minified; the server bundle was the one output that was not. It stops there rather than going further, because identifier mangling would turn every production stack frame into e8 — see the CLI page for the measurements.",
        ],
      },

      { kind: "h2", text: "Earlier versions" },
      {
        kind: "p",
        text: "0.1.5 and 0.1.4 have their own page, and 0.1.3 and 0.1.2 are on past releases.",
      },
    ],
  },

  {
    slug: "v0-1-4-v0-1-5",
    title: "v0.1.4 & v0.1.5",
    summary: "The two deploy releases — why a build would not run where it was not built.",
    blocks: [
      {
        kind: "p",
        text: "Both published 15 August 2026, hours apart, because 0.1.4 did not finish the job it set out to do. They belong together: if you are deploying to a platform that bundles your app into a function, 0.1.4 alone still fails. Both are on npm.",
      },

      { kind: "h2", text: "0.1.5" },
      {
        kind: "p",
        text: "Published hours after 0.1.4, for the half of the problem 0.1.4 left standing.",
      },

      { kind: "h2", text: "The rest of the build now travels with the bundle" },
      {
        kind: "figure",
        label: "what reached a Vercel function",
        text: `  0.1.4                           0.1.5
  ──────────────────────────      ──────────────────────────
  server.mjs      arrived         server.mjs      arrived
  islands.json    left behind     islands.json    inlined
  stylesheet.txt  left behind     stylesheet.txt  inlined

  Island manifest not found       serves`,
      },
      {
        kind: "p",
        text: "0.1.4 stopped the bundle recording its build path and stopped it rescanning routes/, which is what made a copied build 404 every path. It did not stop the server reading .stoneware/islands.json at boot — and that read computed its path at runtime.",
      },
      {
        kind: "p",
        text: "A platform that builds a function by tracing imports cannot follow a path computed at runtime. It followed the static import of the server bundle and carried that across; it never saw the manifest. So the function started with the bundle intact, threw before its first request, and reported a bare 500.",
      },
      {
        kind: "code",
        language: "txt",
        label: "the log that named it",
        text: `Error: Island manifest not found at /var/task/.stoneware/islands.json
    at rebuildIslands (/var/task/.stoneware/server.mjs:1462:14)
    at async createApp (/var/task/.stoneware/server.mjs:1482:8)`,
      },
      {
        kind: "p",
        text: "The build now writes both the island manifest and the stylesheet URL into the generated entry as values. Nothing about serving a request touches the filesystem for them, so there is nothing left for a bundler to miss.",
      },
      {
        kind: "quote",
        text: "The same mistake twice, one layer apart: a path assembled at runtime is invisible to a tool reasoning about imports. First it was routes/, then it was islands.json. A test now asserts the manifest is still inlined, because the way this regresses is silent until someone deploys.",
      },

      { kind: "h2", text: "Also in 0.1.5" },
      {
        kind: "list",
        items: [
          "stoneware doctor warns on 0.1.4 as well as on 0.1.0-0.1.3, naming which of the two deploy failures each version has.",
          "stoneware preview no longer claims an exported site has no Content-Security-Policy. It stopped being true when 0.1.4 started embedding one, and the message had not caught up.",
        ],
      },

      { kind: "h2", text: "0.1.4" },
      {
        kind: "p",
        text: "Published 15 August 2026. One theme: a build should run somewhere other than the machine that produced it. That sounds obvious, and it was not true — which is why deploying to a platform that bundles your app failed in a way that looked like a routing bug.",
      },

      { kind: "h2", text: "Builds that run where they were not built" },
      {
        kind: "figure",
        label: "the same bundle, moved to another directory",
        text: `  before                          now
  ──────────────────────────      ──────────────────────────
  the bundle recorded the         the root is derived from
  absolute path it was built      the bundle's own location
  at, and rescanned routes/
  on every request                a route manifest ships
                                  inside it, so routes/ is a
  → 404 for every path            build input, not a runtime
    somewhere else                  dependency`,
      },
      {
        kind: "p",
        text: "A production build inlined every route and island, then matched paths by scanning routes/ on disk anyway — and hardcoded the build machine's project root. Both are invisible locally, because the directory you build in is the directory you serve from. Move the output and every request 404s while the process reports a clean start.",
      },
      {
        kind: "p",
        text: "This is what made Vercel fail. It is not Vercel-specific: a container that builds in one path and runs in another, a CI artifact handed to a deploy step, and a serverless function unpacked into a scratch directory all hit it.",
      },
      {
        kind: "quote",
        text: "A second bug fell out of testing the first. With islands/ absent, the island registry was rebuilt by rescanning it, so every island quietly degraded to plain markup — no hydration marker, no chunk, nothing logged. Pages looked fine and shipped no JavaScript. An empty registry is indistinguishable from a page that genuinely has no islands, which is what kept it silent.",
      },

      { kind: "h2", text: "Deploying to Vercel" },
      {
        kind: "figure",
        label: "stoneware build --target vercel",
        text: `  server.js      import "./.stoneware/server.js";
                 the Bun preset detects the Bun.serve()
                 call inside it and routes every request

  vercel.json    framework + bunVersion + buildCommand
                 written only if you do not have one`,
      },
      {
        kind: "p",
        text: "Vercel runs Bun as a first-class function runtime, and its Bun framework preset wants exactly one thing: a root entrypoint that calls Bun.serve() at module startup. A built Stoneware server already does that, so the target emits a re-export rather than an adapter — there is no request translation and nothing to keep in sync with the pipeline. See deploying.",
      },
      {
        kind: "p",
        text: "An existing vercel.json is never rewritten. It is hand-maintained configuration that may carry regions, headers or redirects, so anything missing is reported instead — including a functions block, which fails the preset build outright because those patterns only match an api/ directory.",
      },

      { kind: "h2", text: "Dev no longer shares a port by accident" },
      {
        kind: "figure",
        label: "one project on dev, another on start, both on :3000",
        text: `  before                          now
  ──────────────────────────      ──────────────────────────
  dev binds ::1, start binds      dev asks whether anything
  0.0.0.0 — different sockets,    answers on the port first,
  so neither errors               across both loopback
                                  families, and steps past
  both report success; who
  answers depends on the          start still fails loudly:
  client's IPv4/IPv6 order        it must have its own port`,
      },
      {
        kind: "p",
        text: "0.1.3 already walked to the next free port when a bind failed. This is the case where nothing fails: two servers hold the same port on different addresses, both log success, and requests land on whichever one the client's address preference picks. Asking whether the port answers catches it; asking whether the bind failed cannot.",
      },

      { kind: "h2", text: "An exported site keeps its policy" },
      {
        kind: "figure",
        label: "what a static host actually sent",
        text: `  before                          now
  ──────────────────────────      ──────────────────────────
  no Content-Security-Policy      _headers, read by Netlify
  at all — it is a response       and Cloudflare Pages, with
  header, and static files        the full policy
  carry none
                                  <meta http-equiv> in every
  the framework's strongest       page for every other host,
  default, silently absent        minus the three directives
                                  a meta tag cannot carry`,
      },
      {
        kind: "p",
        text: "The claim that the CSP is never silently absent held for stoneware start and quietly failed for stoneware export. Both files are written now, because neither covers every host alone. frame-ancestors, report-uri and sandbox are stripped from the meta tag rather than emitted — browsers ignore them there, and listing a directive you do not enforce is worse than omitting it. The export names what a header-less host gives up. See security.",
      },

      { kind: "h2", text: "Three new commands" },
      {
        kind: "figure",
        label: "stoneware preview / routes / doctor",
        text: `  preview   serves an export with its own conventions —
            <path>/index.html, 404.html for a miss. Previously
            the only way to check an export was to deploy it.

  routes    the compiled table in match order, so you can see
            which pattern a URL actually reaches.

  doctor    setup problems a running server cannot report:
            tsconfig JSX settings, Bun version, .gitignore.`,
      },
      {
        kind: "p",
        text: "doctor's most useful check is the tsconfig one. JSX pointed at React's runtime compiles cleanly and then fails during a render, as a TypeError about an object, blaming a template that is perfectly correct. Also new: stoneware --version prints both the framework and Bun versions, and stoneware dev --open launches a browser.",
      },

      { kind: "h2", text: "Two things that used to fail quietly" },
      {
        kind: "list",
        items: [
          "A style attribute under the default CSP is emitted and then ignored by the browser. Development now says so, naming the element and the fix, and stays silent if your policy permits inline styles.",
          "Islands that were built but never registered rendered as inert markup — correct-looking HTML shipping no JavaScript. The server now says so at boot rather than serving pages that look right and do nothing.",
        ],
      },

      { kind: "h2", text: "Also in 0.1.4" },
      {
        kind: "list",
        items: [
          "Path matching no longer goes through Bun.FileSystemRouter. That removes the workaround for a Bun 1.3.14 native panic on any path containing %, which made GET /%41 a remote denial of service — an abort, not a catchable exception.",
          "Route patterns are matched from a table rather than the filesystem, so dev and production resolve paths through exactly the same code.",
          "A route's default export may be async, and the type now says so. It always worked — the server awaits that call — but Component was declared synchronous, so a database query in a route worked at runtime and failed to typecheck. PageComponent is the route-level type; Component stays synchronous because islands and nested components genuinely are.",
          "The build reports each island's chunk size. JavaScript being opt-in is only checkable if the cost is shown where it is incurred.",
        ],
      },

      { kind: "h2", text: "Either side of these two" },
      {
        kind: "p",
        text: "0.1.6 is on what's new. 0.1.3 and 0.1.2 are on past releases. These two have a page of their own because they are one story told twice, and because the version you are on decides which of the two deploy failures you still have.",
      },
    ],
  },

  {
    slug: "past-releases",
    title: "Past releases",
    summary: "What shipped in 0.1.3 and 0.1.2, and what each change replaced.",
    blocks: [
      {
        kind: "p",
        text: "The older released versions, newest first. Everything here is on npm and installable. 0.1.5 and 0.1.4 have their own page, and what is coming next is on what's new.",
      },

      { kind: "h2", text: "0.1.3" },
      {
        kind: "p",
        text: "Three bugs found by running this site in production, and three features found by wanting to build something real with it. Each entry below says what you had to do before, because that is the only honest way to judge whether an addition earns its place.",
      },

      { kind: "h2", text: "Middleware" },
      {
        kind: "figure",
        label: "an auth check across twelve routes",
        text: `  before                          now
  ──────────────────────────      ──────────────────────────
  paste the check into every      routes/_middleware.ts
  route, and into every route     runs on every request
  added afterwards`,
      },
      {
        kind: "p",
        text: "There was no way to run code across routes at all — no auth guard, no redirect rule, no request logging. That is the gap you hit within a day of building anything real, and copy-paste was the only answer. See middleware and APIs.",
      },

      { kind: "h2", text: "JSON errors and CORS" },
      {
        kind: "figure",
        label: "what a fetch() got back from a failing route",
        text: `  before                          now
  ──────────────────────────      ──────────────────────────
  <!DOCTYPE html>...              { "error": "Not Found",
  the full error page               "status": 404 }
  and nothing parseable`,
      },
      {
        kind: "p",
        text: "API routes existed and worked, but everything around them was missing. Errors now negotiate on Accept, and cross-origin access is configurable — off by default, since an API only your own pages call never needed it.",
      },

      { kind: "h2", text: "notFound()" },
      {
        kind: "figure",
        label: "a [slug] route asked for something that does not exist",
        text: `  before                          now
  ──────────────────────────      ──────────────────────────
  render "no such page"           notFound()
  and serve it with 200           renders _404 with a 404
  → a soft 404 Google indexes`,
      },
      {
        kind: "p",
        text: "routes/_404.tsx only fires when nothing matched. A [slug] route matches any slug, so it could only ever render not-found markup with a success status. This site had exactly that bug. See error pages.",
      },

      { kind: "h2", text: "Correct URLs behind a proxy" },
      {
        kind: "figure",
        label: "a site served over https by Render",
        text: `  before                          now
  ──────────────────────────      ──────────────────────────
  <link rel="canonical"           trustProxy: "proto"
    href="http://...">            → https:// everywhere
  every page, telling Google
  the insecure URL is real`,
      },
      {
        kind: "p",
        text: "Every platform that terminates TLS forwards a plain HTTP request, so url.origin reported http:// on an https:// site. Off by default because those headers are forgeable; \"proto\" trusts only the scheme, which is safe anywhere and fixes the common case. See deploying.",
      },

      { kind: "h2", text: "Smaller things" },
      {
        kind: "list",
        items: [
          "stoneware dev walks to the next free port instead of refusing to start. Production still fails loudly, because a platform routes traffic to the port it assigned.",
          "stoneware export writes non-HTML routes at their literal path. A sitemap.xml route used to land at sitemap.xml/index.html, where no crawler would find it.",
          "New projects ship robots.txt, sitemap.xml, a favicon and the Stoneware mark, with SITE_URL wired through so absolute URLs are right from the first deploy.",
        ],
      },

      { kind: "h2", text: "0.1.2" },
      {
        kind: "p",
        text: "Published 13 August 2026. Lazy hydration (client:visible, client:idle, client:media), static export, custom error pages, co-located CSS, a head export, <Image>, seo(), and browser diagnostics in development.",
      },
      {
        kind: "list",
        items: [
          "Production stopped rebuilding island chunks at boot, which was crashing serverless deploys against a read-only filesystem.",
          "The server binds 0.0.0.0 in production, so platform health checks reach it.",
          "public/ assets revalidate instead of going stale for an hour after a deploy, and HTML responses answer 304.",
        ],
      },
      {
        kind: "quote",
        text: "This site runs on the published package rather than a local checkout, so everything on this page is behaviour you can install — not behaviour that only exists in the repository. That is also why unreleased work lives on what's new instead of here.",
      },
      {
        kind: "p",
        text: "Still on one of these? The deploying and CLI pages mark which behaviour belongs to which version, so nothing here needs cross-referencing against a changelog.",
      },
    ],
  },

  {
    slug: "database",
    title: "Databases",
    summary: "Where db.ts goes, where queries run, and the one place they must never.",
    blocks: [
      {
        kind: "p",
        text: "Stoneware has no data layer, deliberately. There is no ORM to configure, no query builder to learn, and no loader API sitting between your route and your data. A Stoneware app is a Bun process, so you use whatever a Bun process uses — and Bun already ships two databases.",
      },
      {
        kind: "list",
        items: [
          "bun:sqlite — built in, no install, no driver. Good for content sites, and for anything single-node.",
          "Bun.sql — Postgres, built in.",
          "Anything else works too: Drizzle, Prisma, pg, mysql2. Nothing about them is special-cased, because nothing has to be.",
        ],
      },

      { kind: "h2", text: "Where the file goes" },
      {
        kind: "figure",
        label: "lib/ is for behavior, not markup",
        text: `my-site/
├── routes/          request handling and pages
├── islands/         client JavaScript  <- never database code
├── lib/
│   ├── db.ts        the connection, opened once
│   └── posts.ts     the queries, as plain functions
└── public/`,
      },
      {
        kind: "p",
        text: "lib/ is where non-UI logic lives. Put the connection in lib/db.ts and the queries beside it in lib/posts.ts — plain functions taking arguments and returning rows. Routes then read as markup with a function call in them, and the queries stay testable without a request.",
      },

      { kind: "h2", text: "The connection" },
      {
        kind: "code",
        label: "lib/db.ts",
        text: `import { Database } from "bun:sqlite";

// Module scope, so this runs once per process rather than once per request.
export const db = new Database("data.sqlite", { create: true });

db.run("pragma journal_mode = WAL");`,
      },
      {
        kind: "code",
        label: "lib/posts.ts",
        text: `import { db } from "./db.ts";

export interface Post {
  slug: string;
  title: string;
  body: string;
}

const bySlug = db.query("select * from posts where slug = ?");

export function getPost(slug: string): Post | null {
  return bySlug.get(slug) as Post | null;
}`,
      },
      {
        kind: "quote",
        text: "Prepared statements at module scope, like the connection: db.query() compiles the SQL once, and re-preparing it on every request is the most common way a SQLite-backed page ends up slower than it should be.",
      },

      { kind: "h2", text: "One thing that will bite you in development" },
      {
        kind: "figure",
        label: "editing lib/db.ts under `stoneware dev`",
        text: `  [lib] connection opened: zi7s0x
  [entry] using zi7s0x

  ... you save lib/db.ts ...

  [lib] connection opened: emk9cd     <- a second one
  [entry] using emk9cd                   the first is still open`,
      },
      {
        kind: "p",
        text: "The dev server runs under bun --hot, which re-evaluates a module when you edit it. Module scope means once per process, and a hot reload is not a new process — so editing lib/db.ts opens another connection and leaks the previous one. With SQLite you may only notice a file lock; with a Postgres pool you will exhaust it after enough saves.",
      },
      {
        kind: "code",
        label: "lib/db.ts — surviving hot reload",
        text: `import { Database } from "bun:sqlite";

// Hung off globalThis so a hot reload finds the existing connection instead of
// opening a second one. Production evaluates this module once and never
// re-enters it, so the cache is only ever load-bearing in development.
const global = globalThis as { __db?: Database };

export const db = global.__db ?? new Database("data.sqlite", { create: true });

if (!global.__db) {
  db.run("pragma journal_mode = WAL");
  global.__db = db;
}`,
      },

      { kind: "h2", text: "Where queries run" },
      {
        kind: "p",
        text: "A route's default export may be async. The server awaits that one call before rendering starts, which is what lets a page load its own data with no loader API in between.",
      },
      {
        kind: "quote",
        text: "On 0.1.3 and earlier this ran correctly and failed to typecheck: Component was declared synchronous and used for routes too. 0.1.4 added PageComponent for the route-level case, so an async route now typechecks as written.",
      },
      {
        kind: "code",
        label: "routes/blog/[slug].tsx",
        text: `import { notFound } from "stoneware";
import type { PageProps } from "stoneware";
import { getPost } from "../../lib/posts.ts";

export default async function Post({ params }: PageProps) {
  const post = getPost(params.slug);

  // A [slug] route matches any slug, so a miss has to say so explicitly -
  // otherwise it renders not-found markup with a 200 and Google indexes it.
  if (!post) notFound();

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}`,
      },
      {
        kind: "list",
        items: [
          "Route pages — async default export, as above.",
          "Server actions — routes/api/*.ts handlers, for writes.",
          "Middleware — routes/_middleware.ts, for a session lookup that every route needs.",
          "lib/ — the queries themselves, called from any of the above.",
        ],
      },
      {
        kind: "quote",
        text: "Only the route's own default export may be async. Rendering is a single synchronous pass to a string, so a component nested inside JSX has no point at which a promise could be resolved — it throws with a message saying so rather than rendering [object Promise]. Fetch in the route, pass the result down as props.",
      },

      { kind: "h2", text: "Never in islands/" },
      {
        kind: "figure",
        label: "the boundary is the directory",
        text: `  routes/    server     database code belongs here
  lib/       server     and here
  islands/   browser    and never here`,
      },
      {
        kind: "p",
        text: "Anything under islands/ is bundled for the browser. A database import there is not a security hole so much as a broken build — but the instinct it comes from is worth naming: fetch on the server, hand the island the rows it needs as props.",
      },
      {
        kind: "quote",
        text: "Bun does not inline process.env for a browser target, so a secret an island reads evaluates to undefined rather than being baked into the chunk your visitors download. Vite and webpack-with-DefinePlugin do bake it in. A test asserts this, because it is an accidental property of the bundler rather than something the framework asks for.",
      },

      { kind: "h2", text: "Writes go through a server action" },
      {
        kind: "code",
        label: "routes/api/comment.ts",
        text: `import type { ActionContext } from "stoneware";
import { addComment } from "../../lib/posts.ts";

export async function POST({ request }: ActionContext) {
  // The CSRF token was already verified before this ran - the framework does it
  // for every non-GET request, and there is no per-route opt-in.
  const form = await request.formData();
  addComment(String(form.get("slug")), String(form.get("body")));

  return new Response(null, { status: 303, headers: { Location: "/thanks" } });
}`,
      },
      {
        kind: "p",
        text: "Pair it with the Form helper, which injects the CSRF field for you. See server actions.",
      },

      { kind: "h2", text: "Credentials" },
      {
        kind: "p",
        text: "Bun loads .env natively, so a connection string belongs there and nowhere else. The same file already holds STONEWARE_CSRF_SECRET, which production refuses to start without.",
      },
      {
        kind: "code",
        language: "sh",
        label: ".env",
        text: `DATABASE_URL=postgres://user:pw@host/db
STONEWARE_CSRF_SECRET=a-long-random-string`,
      },

      { kind: "h2", text: "If you export the site" },
      {
        kind: "p",
        text: "stoneware export runs every page once at build time and writes the HTML, so database-backed pages capture a snapshot rather than staying live. That is exactly right for a blog rebuilt on publish, and wrong for anything that changes between deploys — that needs stoneware start.",
      },
      {
        kind: "quote",
        text: "Export also skips server actions entirely, so the write path above has no static equivalent. A fully static site is one with no mutating requests; if you need the form, you need a running server.",
      },
    ],
  },

  {
    slug: "middleware",
    title: "Middleware and APIs",
    summary: "One file that runs on every request, and what changed for API routes.",
    blocks: [
      {
        kind: "p",
        text: "Add routes/_middleware.ts and it runs on every request. Return a Response to answer there and stop; return nothing to carry on to the route.",
      },
      {
        kind: "code",
        label: "routes/_middleware.ts",
        text: `import type { MiddlewareContext } from "stoneware";

export default function middleware({ request, url, locals }: MiddlewareContext) {
  if (url.pathname.startsWith("/admin") && !isAuthed(request)) {
    return new Response(null, { status: 302, headers: { Location: "/login" } });
  }

  locals.user = getUser(request);
}`,
      },
      {
        kind: "p",
        text: "Whatever middleware puts on locals reaches the page or API route that handles the request. It is typed by declaration merging, so the framework never has to guess your shape.",
      },
      {
        kind: "code",
        label: "anywhere in your project",
        text: `declare module "stoneware" {
  interface Locals {
    user?: { id: string; name: string };
  }
}`,
      },

      { kind: "h2", text: "Where it runs, and why that is the whole design" },
      {
        kind: "figure",
        label: "the request pipeline",
        text: `  static assets
       │
       ▼
  CSRF verification      ← always first
       │
       ▼
  _middleware.ts         ← after verification, before matching
       │
       ▼
  route match  ──► 404
       │
       ▼
  page or API handler
       │
       ▼
  security headers       ← always last, single exit`,
      },
      {
        kind: "p",
        text: "After CSRF, never before. Middleware is ordinary project code, and code that ran ahead of verification could act on a request that was about to be rejected — which is how a framework acquires a documented way around its own protection.",
      },
      {
        kind: "p",
        text: "Before route matching, so it also sees requests that are about to 404. A redirect rule for a page you deleted is worth nothing if it only fires for paths that still resolve.",
      },
      {
        kind: "quote",
        text: "There is deliberately no next() and no way to wrap the finished response. Security headers are applied at one exit; middleware that could rewrite the response could remove them.",
      },

      { kind: "h2", text: "JSON errors" },
      {
        kind: "p",
        text: "An API client that hits a failing route used to receive the HTML error page — a fetch() would resolve with <!DOCTYPE html> in the body and nothing usable in it. Errors are now negotiated.",
      },
      {
        kind: "code",
        language: "txt",
        label: "same route, two callers",
        text: `fetch("/api/thing")            →  { "error": "Not Found", "status": 404 }
browser navigates to it       →  the _404 page, as before`,
      },
      {
        kind: "p",
        text: "Decided from the Accept header rather than from the path, because a route under routes/api/ that someone navigates to in a browser is still a navigation. In development the response carries detail and stack; production sends neither.",
      },

      { kind: "h2", text: "CORS" },
      {
        kind: "p",
        text: "Off unless you configure it. An API that only your own pages call never needed it, and enabling it by default would quietly make every internal endpoint callable from anywhere.",
      },
      {
        kind: "code",
        label: "stoneware.config.ts",
        text: `export default defineConfig({
  cors: {
    origin: ["https://app.example.com"],
    credentials: true,
  },
});`,
      },
      {
        kind: "list",
        items: [
          "An allowed origin is echoed back rather than answered with *, and the response gets Vary: Origin — without it a shared cache can hand one origin's response to another.",
          "Preflights are answered before CSRF, because a browser sends OPTIONS with no body and no token by design and will not send the real request until it succeeds.",
          "origin: \"*\" together with credentials: true throws at startup. Browsers reject that pairing outright, so failing at boot names the problem instead of leaving an unexplained console error.",
        ],
      },
      {
        kind: "quote",
        text: "A cross-origin POST still needs its CSRF token. CORS decides who may read a response; it does not decide who may act. That is the assumption most often got wrong, so it is asserted by a test rather than left to a sentence in a document.",
      },
    ],
  },

  {
    slug: "benchmark",
    title: "Benchmark",
    summary: "The same 16-page site built in Stoneware, Astro and Next.js, measured.",
    blocks: [
      {
        kind: "p",
        text: "A portfolio and blog: home, about, contact, a blog index with five posts, and a docs section with seven pages. Built three times with matching content and the same five interactive components, then measured under Lighthouse mobile throttling — 1638 Kbps, 150 ms RTT, 4x CPU slowdown — 10 runs per page, median reported.",
      },
      {
        kind: "figure",
        label: "Stoneware 0.1.3 · Astro 5.18.2 · Next.js 15.5.23 (React 19.2.8)",
        text: `                      Stoneware      Astro     Next.js
  ──────────────────────────────────────────────────────
  JS transferred          14.2 KB   193.1 KB    346.0 KB
  HTML                     3.4 KB     8.1 KB     10.2 KB
  Total transferred       22.5 KB   205.2 KB    359.4 KB
  Requests                      8          8           7
  ──────────────────────────────────────────────────────
  LCP                      1217 ms    2253 ms     2965 ms
  FCP                      1062 ms    1429 ms      754 ms
  Total blocking time         0 ms       0 ms       58 ms
  CLS                        0.000      0.000       0.000
  Lighthouse perf              100         99          95
  ──────────────────────────────────────────────────────
  Build, 16 pages cold      0.71 s    35.6 s      61.6 s`,
      },

      { kind: "h2", text: "JavaScript is the whole story" },
      {
        kind: "p",
        text: "All three score CLS 0.000 and a TTFB of 1–3 ms against a warm local server, so layout stability and server latency are noise here. What separates them is the client bundle: 14.2 KB against 193.1 and 346.0, uncompressed, for the same five islands. At 1638 Kbps that is roughly one and 1.7 extra seconds of download, and the LCP spread tracks it almost exactly.",
      },
      {
        kind: "figure",
        label: "how much more JavaScript, for the same page",
        text: `  Stoneware  ██                                    14.2 KB   1.0x
  Astro      ████████████████████████             193.1 KB  13.6x
  Next.js    ███████████████████████████████████  346.0 KB  24.4x`,
      },

      { kind: "h2", text: "The shape of the result is more interesting than the totals" },
      {
        kind: "p",
        text: "Astro's LCP is almost perfectly flat — 2252 to 2253 ms across nearly every page, whether that page carries 426 or 3,367 bytes of content. Next.js shows the same pattern at about 2960 ms. A fixed cost is dominating: the React client runtime sits on the critical path every time, so page weight is irrelevant beside it.",
      },
      {
        kind: "p",
        text: "Stoneware is the only one whose LCP actually varies with the page, from 909 ms to 1512 ms. That is what it looks like when there is no fixed runtime cost for content to hide behind — the page is the only thing being paid for.",
      },
      {
        kind: "quote",
        text: "Framework overhead also scales differently. Stoneware adds a roughly constant ~2.4 KB of HTML per page. Next.js grows with content — 9.7 KB on the home page to 12.2 KB on a blog post — because the RSC flight payload re-encodes the rendered output alongside the HTML, so the content is effectively sent twice.",
      },

      { kind: "h2", text: "Where the others win" },
      {
        kind: "list",
        items: [
          "Next.js wins FCP outright: 754 ms against 1062 and 1429. It inlines more of the critical path and manages CSS through the bundle, so first paint lands early — and then LCP waits about 2.2 s longer for the JavaScript that makes the paint useful. Fast first paint, slow useful paint.",
          "Next.js also serves the fewest requests, 7 against 8.",
          "Astro matches Stoneware on total blocking time at 0 ms. Next.js is the only one with meaningful main-thread blocking, at 58 ms median and up to 82 ms.",
        ],
      },
      {
        kind: "p",
        text: "The Lighthouse scores are 100, 99 and 95. All three would pass a casual audit, which is worth knowing about the score itself: a 24x spread in JavaScript shipped is invisible inside it.",
      },

      { kind: "h2", text: "Reading the numbers fairly" },
      {
        kind: "list",
        items: [
          "Bytes are uncompressed. Production would gzip or brotli all three, which narrows the transfer gap — but not the parse-and-execute gap. 346 KB of JavaScript still costs main-thread time that 14.2 KB does not.",
          "The build column is not like-for-like. stoneware build emits a server bundle; Astro and Next.js prerender 16 HTML files. The comparable command is stoneware export, measured at 0.63 s. Build timing was also the noisiest metric — treat the ordering as the result and the absolute values as indicative.",
          "Serving modes differ. Stoneware rendered each request through stoneware start; the other two were prerendered static files. That favours them on TTFB, though all three measured 1–3 ms locally.",
          "The content is lighter than a real site's — posts run 214 to 500 words. A heavier corpus would widen the HTML gaps and shift LCP further toward content download.",
        ],
      },
      {
        kind: "quote",
        text: "Measured on one machine, in one session, with the browser open. A 10-run median absorbs some of that but not all of it. The numbers are reproducible from the benchmark repository rather than asserted here.",
      },
    ],
  },
];

/**
 * Sidebar sections.
 *
 * Presentation only: every page keeps its slug, its URL and its content. This
 * exists because eighteen entries in one flat list stopped being a reading
 * order and became a search problem - "what's new" sat between "deploying" and
 * "middleware", which is nobody's learning path.
 *
 * The order here is the order everywhere. `DOC_ORDER` below is derived from it
 * and drives prev/next, so the sidebar and the footer links cannot disagree.
 */
export interface DocGroup {
  label: string;
  slugs: string[];
}

export const DOC_GROUPS: DocGroup[] = [
  {
    label: "Get started",
    slugs: ["why", "quick-start", "project-structure", "how-it-works"],
  },
  {
    label: "Core",
    slugs: [
      "routing",
      "islands",
      "hydration",
      "head-and-images",
      "seo",
      "styling",
      "error-pages",
      "error-boundaries",
    ],
  },
  {
    label: "Server",
    slugs: ["server-actions", "middleware", "database"],
  },
  {
    label: "Security",
    slugs: ["security"],
  },
  {
    label: "Build & deploy",
    slugs: ["cli", "deploying"],
  },
  {
    label: "Reference",
    slugs: ["benchmark"],
  },
  {
    label: "Releases",
    slugs: ["whats-new", "v0-1-4-v0-1-5", "past-releases"],
  },
];

/**
 * Every page, in sidebar order.
 *
 * Built from the groups rather than maintained beside them, and checked against
 * DOCS on load: a page added without being grouped would otherwise vanish from
 * the sidebar while still being reachable by URL, which is the kind of thing
 * nobody notices for months.
 */
export const DOC_ORDER: DocPage[] = (() => {
  const byslug = new Map(DOCS.map((page) => [page.slug, page]));
  const ordered: DocPage[] = [];

  for (const group of DOC_GROUPS) {
    for (const slug of group.slugs) {
      const page = byslug.get(slug);
      if (!page) throw new Error(`DOC_GROUPS lists "${slug}", which is not a page in DOCS.`);
      if (ordered.includes(page)) throw new Error(`DOC_GROUPS lists "${slug}" more than once.`);
      ordered.push(page);
    }
  }

  const ungrouped = DOCS.filter((page) => !ordered.includes(page));
  if (ungrouped.length > 0) {
    throw new Error(
      `These pages are not in any DOC_GROUPS section and would not appear in the sidebar: ` +
        ungrouped.map((page) => page.slug).join(", "),
    );
  }

  return ordered;
})();

/** The pages of one group, in order. */
export function pagesInGroup(group: DocGroup): DocPage[] {
  return group.slugs.map((slug) => DOCS.find((page) => page.slug === slug)!);
}

export function getDoc(slug: string): DocPage | undefined {
  return DOCS.find((page) => page.slug === slug);
}

export interface DocNeighbors {
  previous?: DocPage;
  next?: DocPage;
}

export function getNeighbors(slug: string): DocNeighbors {
  // DOC_ORDER, not DOCS: the footer links have to walk the same path the
  // sidebar shows, or "next" points somewhere the sidebar says is elsewhere.
  const index = DOC_ORDER.findIndex((page) => page.slug === slug);
  if (index === -1) return {};
  return { previous: DOC_ORDER[index - 1], next: DOC_ORDER[index + 1] };
}
