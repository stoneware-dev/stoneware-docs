/**
 * Liveness endpoint, served at /health.
 *
 * A module under routes/ that exports HTTP method handlers is a server action
 * rather than a page — the router classifies by module shape, not by directory,
 * so this does not need to live under routes/api/. Keeping it at the top level
 * gives platforms the conventional /health path to point a health check at.
 *
 * GET is a safe method, so the CSRF layer lets it through untouched and this
 * stays reachable without a token.
 */

import type { ActionContext } from "stoneware";

/** Process start, captured once at module load rather than per request. */
const startedAt = Date.now();

export function GET(_context: ActionContext): Response {
  return Response.json(
    {
      status: "ok",
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      timestamp: new Date().toISOString(),
    },
    {
      // A cached health check is a health check that lies: platforms and
      // uptime monitors need to see the state of *this* instance, now.
      headers: { "Cache-Control": "no-store" },
    },
  );
}
