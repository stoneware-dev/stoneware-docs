/**
 * The site shell.
 *
 * A layout is just a function that returns markup - no base class, no special
 * export, no registration. It lives in lib/ because it is shared, not because
 * the framework demands it.
 */

import type { Child } from "stoneware";
import FiringGauge from "../islands/FiringGauge.tsx";
import ThemeToggle from "../islands/ThemeToggle.tsx";
import { REPO_SLUG, REPO_URL } from "./site.ts";
import type { Theme } from "./theme.ts";

export interface LayoutProps {
  title: string;
  description: string;
  /** Highlights the matching top-level nav entry. */
  section?: "docs" | "home";
  /**
   * The visitor's stored preference. Omitted when they have none, which leaves
   * the choice to `prefers-color-scheme` - see lib/theme.ts.
   */
  theme?: Theme;
  children?: Child;
}

export function Layout({ title, description, section = "home", theme, children }: LayoutProps) {
  return (
    // Rendered server-side from the cookie, so the first paint is already the
    // right theme. Absent the attribute the stylesheet falls back to the OS.
    <html lang="en" data-theme={theme}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="color-scheme" content="light dark" />
        {/* The vector covers every size a browser asks for, so there is no set
            of PNG variants to keep in step with the mark. The .ico is the
            fallback for clients that ignore the link entirely and fetch
            /favicon.ico by convention - unfurlers, feed readers, bookmark
            tools. Both are rasterised from the same mark.svg geometry. */}
        <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />
        <link rel="icon" href="/mark.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <a class="skip" href="#main">
          Skip to content
        </a>

        <header class="masthead">
          <a class="wordmark" href="/">
            {/* alt="" because the link text already names it; announcing the
                mark again would just repeat "stoneware" to a screen reader. */}
            <img class="wordmark__mark" src="/mark.svg" alt="" width="22" height="22" />
            stoneware
          </a>
          <nav>
            <a href="/" aria-current={section === "home" ? "page" : undefined}>
              Overview
            </a>
            <a href="/docs" aria-current={section === "docs" ? "page" : undefined}>
              Docs
            </a>
            <a href="/docs/quick-start">Quick start</a>
          </nav>
          <div class="tools">
            <a
              class="iconlink"
              href={REPO_URL}
              rel="noopener"
              aria-label={`Stoneware on GitHub (${REPO_SLUG})`}
              title="Source on GitHub"
            >
              <GitHubMark />
            </a>
            <ThemeToggle />
          </div>
        </header>

        <FiringGauge />

        <main id="main">{children}</main>

        <footer class="shell colophon">
          <span>
            Rendered on the server by stoneware. This page runs under the framework's default
            Content-Security-Policy, unmodified.
          </span>
          <span>
            Documentation for <a href={REPO_URL}>{REPO_SLUG}</a> · <a href="/docs">Docs</a> ·{" "}
            <a href="/docs/security">Security</a> · MIT
          </span>
        </footer>
      </body>
    </html>
  );
}

/**
 * The GitHub mark, inline.
 *
 * An <img> would be a second request for an 800-byte icon, and `img-src 'self'`
 * rules out serving it from a CDN anyway. It lives in a route-side template
 * rather than an island because the client runtime creates elements without a
 * namespace, which is fine for HTML and wrong for SVG.
 */
function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  );
}
