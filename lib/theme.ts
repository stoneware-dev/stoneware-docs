/**
 * The stored theme preference.
 *
 * The usual way to avoid a theme flash is a blocking inline <script> in <head>
 * that reads localStorage before first paint. This site runs under the
 * framework's default `script-src 'self'`, which blocks exactly that — and the
 * server-first answer is better anyway: keep the preference in a cookie, and it
 * arrives with the request. The server knows the theme while it is still
 * writing the <html> tag, so there is nothing to correct after paint.
 *
 * With no cookie the attribute is omitted entirely and `prefers-color-scheme`
 * decides, which is the right answer for a first visit.
 *
 * The constants are shared with the ThemeToggle island, which writes the same
 * cookie from the browser. `themeFromRequest` is server-only; it is dropped
 * from the island bundle because nothing there imports it.
 */

export type Theme = "dark" | "light";

export const THEME_COOKIE = "sw-theme";

/** A year: long enough that the choice feels permanent, short enough to lapse. */
export const THEME_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * The visitor's stored choice, or undefined when they have not made one.
 *
 * An unrecognised value is treated as absent rather than trusted — the cookie
 * is written by client script and lands in an HTML attribute.
 */
export function themeFromRequest(request: Request): Theme | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;

  const value = new Bun.CookieMap(header).get(THEME_COOKIE);
  return value === "dark" || value === "light" ? value : undefined;
}
