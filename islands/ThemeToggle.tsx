/**
 * The theme switch.
 *
 * Deliberately stateless. The switch's appearance — which icon is lit, which
 * side the knob sits on — is derived in CSS from the resolved `color-scheme`,
 * so the server renders it in the correct position without being told, and it
 * stays correct if the OS preference changes while the page is open. There is
 * no signal here because there is nothing for one to hold.
 *
 * All this island contributes is the click: flip the attribute the stylesheet
 * keys off, and record the choice in a cookie so the server can render the same
 * attribute on the next request. Setting `dataset` is a DOM write, not an
 * inline style, so the default CSP is untouched.
 */

import { THEME_COOKIE, THEME_MAX_AGE, type Theme } from "../lib/theme.ts";

/**
 * What the visitor is looking at right now.
 *
 * Before the first click there is no attribute to read, and the answer is
 * whatever `prefers-color-scheme` resolved to — the same question the
 * stylesheet asked.
 */
function currentTheme(): Theme {
  const stored = document.documentElement.dataset.theme;
  if (stored === "dark" || stored === "light") return stored;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function flip(): void {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";

  document.documentElement.dataset.theme = next;
  document.cookie =
    `${THEME_COOKIE}=${next}; path=/; max-age=${THEME_MAX_AGE}; samesite=lax`;
}

export default function ThemeToggle() {
  return (
    <button
      type="button"
      class="theme"
      onClick={flip}
      // The button's own state is ambient rather than announced: naming the
      // action avoids claiming a state the server cannot know at render time.
      aria-label="Switch between the dark and light theme"
      title="Switch theme"
    >
      <span class="theme__icon theme__icon--sun" aria-hidden="true" />
      <span class="theme__track" aria-hidden="true">
        <span class="theme__knob" />
      </span>
      <span class="theme__icon theme__icon--moon" aria-hidden="true" />
    </button>
  );
}
