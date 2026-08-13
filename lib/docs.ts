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
        text: `  Whole client runtime (signals + hydrate + DOM)     ~3.2 KB
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
  scheduler        ~1 KB           runtime          ~3.2 KB
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
        text: "raw() is deliberately more effort than the safe path, and greppable during review. Two things the renderer refuses outright, because escaping cannot make them safe: interpolating dynamic values into script or style bodies, and attribute names that could break out of a tag.",
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
        text: `stoneware dev     # dev server with hot reload
stoneware build   # production build
stoneware start   # run the production server bundle
stoneware export  # prerender every page to static HTML`,
      },
      { kind: "h2", text: "Development" },
      {
        kind: "p",
        text: "One process serves pages, built island chunks, and the live-reload socket. There is no second dev server and no proxy. Editing a file under routes/, islands/ or lib/ rebuilds and reloads the browser.",
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
        text: "Route modules are inlined into the server bundle, but path matching still uses Bun.FileSystemRouter, so routes/ must exist at runtime. It is read for its filenames, never its contents.",
      },
      { kind: "h2", text: "Static export" },
      {
        kind: "p",
        text: "stoneware export prerenders every page to a directory of plain HTML files. It builds first, then fetches each route through the ordinary request pipeline — the same router, the same renderer, the same response headers — so what lands on disk is byte-identical to what the server would have sent. There is no second rendering path to drift.",
      },
      {
        kind: "code",
        language: "sh",
        label: "terminal",
        text: `$ stoneware export --out dist

[stoneware] exported 12 page(s) in 486ms
  output   /srv/my-site/dist
  skipped  /subscribe (renders a CSRF token)`,
      },
      {
        kind: "p",
        text: "The output has no runtime requirement at all, which is the point: it deploys to Cloudflare Pages, Netlify, GitHub Pages or any CDN — hosts that cannot run Bun and so cannot run a Stoneware server.",
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
          "The Bun runtime. Not Node, not a V8 isolate — the framework is built on Bun.serve, Bun.CSRF, Bun.escapeHTML and Bun.FileSystemRouter.",
          "The routes/ directory, on disk, at request time. Path matching reads its filenames on every request.",
          ".stoneware/islands.json from the build. Without it the server tries to rebuild island bundles, which writes to disk.",
          "public/, if the app serves static assets.",
        ],
      },
      {
        kind: "quote",
        text: "Those last three are why a platform that bundles your function needs to be told about them explicitly: a directory that is only ever scanned is invisible to a bundler tracing imports.",
      },

      { kind: "h2", text: "The server entry point" },
      {
        kind: "p",
        text: "Add a server.ts at the project root. One Bun.serve() call, handing every request to the app. This same file runs everywhere — there is nothing platform-specific in it.",
      },
      {
        kind: "code",
        label: "server.ts",
        text: `import { createApp } from "stoneware";
import config from "./stoneware.config.ts";

// dev: false reads the island manifest that \`stoneware build\` wrote, rather
// than rebuilding chunks (and changing their hashed filenames) on every start.
const app = await createApp(config, { dev: false });

Bun.serve({
  port: Number(Bun.env.PORT ?? 3000),
  fetch: (request) => app.fetch(request),
});`,
      },
      {
        kind: "code",
        language: "sh",
        label: "deploy",
        text: `bun install
stoneware build      # writes .stoneware/
bun server.ts        # serves`,
      },

      { kind: "h2", text: "Which platforms work" },
      {
        kind: "figure",
        label: "the runtime decides, not the framework",
        text: `                      runs Bun?   ships whole dir?
  VPS / Docker            yes           yes        works as-is
  Fly.io                  yes           yes        works as-is
  Railway / Render        yes           yes        works as-is

  Vercel                  yes           no         needs includeFiles
                                                   (it bundles the function)

  Netlify / Cloudflare     no           -          wrong runtime
  GitHub Pages, any CDN    no           -          no runtime at all
                                                   -> stoneware export`,
      },
      {
        kind: "p",
        text: "Anywhere you can run `bun server.ts` against the project directory, nothing extra is required — the directory is simply there. Cloudflare Workers run V8 isolates and Netlify Functions run Node, so neither can host a Stoneware server; for those, prerender the site instead.",
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
        kind: "code",
        language: "txt",
        label: "vercel.json",
        text: `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "bun",
  "bunVersion": "1.x",
  "buildCommand": "bun node_modules/stoneware/bin/stoneware.mjs build"
}`,
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
        text: "If the function starts but crashes, the likely cause is that routes/ or .stoneware/islands.json did not reach the runtime. A serverless filesystem is read-only outside /tmp, so a missing build manifest makes the server fall back to rebuilding island bundles, and that write fails in a way that looks unrelated to the cause. The fallback is the /api model — move the entry to api/server.ts and add rewrites, where functions.includeFiles does apply because the pattern then matches a real function.",
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

for (const path of ["routes", ".stoneware/islands.json"]) {
  if (!existsSync(resolve(process.cwd(), path))) {
    console.error(\`[stoneware] missing \${path} in \${process.cwd()} — ` +
          `it was not included in the deployed bundle\`);
  }
}`,
      },
    ],
  },

  {
    slug: "whats-new",
    title: "What's new in 0.1.2",
    summary: "Lazy hydration, static export, error pages, SEO and images — and two deploy fixes.",
    blocks: [
      {
        kind: "p",
        text: "Published to npm on 13 August 2026. Despite the patch number this is a feature release, so anyone on ^0.1.1 picks all of it up automatically.",
      },
      {
        kind: "code",
        language: "sh",
        label: "terminal",
        text: `bun update stoneware      # existing project
bunx create-stoneware my-site   # new one`,
      },

      { kind: "h2", text: "Added" },
      {
        kind: "list",
        items: [
          "Lazy island hydration — client:visible, client:idle and client:media on the usage site. A deferred island emits no script tag; a ~1 KB scheduler fetches its chunk when the trigger fires. See when islands hydrate.",
          "Static export — stoneware export prerenders every page through the ordinary request pipeline, so what lands on disk is byte-identical to a served response. It deploys to hosts that cannot run Bun at all. See CLI and builds.",
          "Custom error pages — routes/_404.tsx and routes/_500.tsx, rendered through your own layout. See error pages.",
          "Co-located CSS — a .css beside any file under routes/, islands/ or lib/ is collected, hashed and linked for you. See styling.",
          "A head export, for per-page metadata without owning the whole document. See head and images.",
          "<Image> — reserved space, lazy loading, async decoding, and a preload for the one image that matters. No dependency and no resize pipeline.",
          "seo() — title, description, canonical, Open Graph, X cards, robots, hreflang and JSON-LD from one object, with every field optional. See SEO and sharing.",
          "Browser diagnostics in development — a failed rebuild now shows an overlay with file, line and source rather than only a line in the terminal.",
        ],
      },

      { kind: "h2", text: "Fixed" },
      {
        kind: "list",
        items: [
          "Production no longer rebuilds island chunks at boot. It reads the build manifest, or fails with a message naming the cause — a serverless deploy previously crashed opaquely against a read-only filesystem.",
          "The server binds 0.0.0.0 in production, so platform health checks on Render, Railway and Fly reach it.",
          "public/ assets carry ETag and Last-Modified and revalidate, instead of going stale for an hour after a deploy.",
          "HTML responses carry an ETag and answer 304. A page that renders a CSRF token is private, no-store and never reaches a shared cache. See caching.",
        ],
      },

      { kind: "h2", text: "Changed" },
      {
        kind: "p",
        text: "Two behaviour changes worth knowing before you upgrade.",
      },
      {
        kind: "list",
        items: [
          "A route file whose name starts with _ is no longer servable. /_404 now returns the 404 page rather than that page with a 200 — so a routes/_something.tsx you were serving deliberately will stop.",
          "The island hydration payload changed shape. Internal, and server and client ship together, but a version mismatch now logs a named error instead of leaving every island on the page silently inert.",
        ],
      },
      {
        kind: "quote",
        text: "This site runs on the published package rather than a local checkout, so everything documented here is behaviour you can install — not behaviour that only exists in the repository.",
      },
    ],
  },
];

export function getDoc(slug: string): DocPage | undefined {
  return DOCS.find((page) => page.slug === slug);
}

export interface DocNeighbors {
  previous?: DocPage;
  next?: DocPage;
}

export function getNeighbors(slug: string): DocNeighbors {
  const index = DOCS.findIndex((page) => page.slug === slug);
  if (index === -1) return {};
  return { previous: DOCS[index - 1], next: DOCS[index + 1] };
}
