# test

Built with [stoneware](https://github.com/stoneware-dev/stoneware-core) - server-first, Bun-native.

    bun install
    bun run dev

## Layout

    routes/    Server-rendered pages and API routes. Never ships JavaScript.
    islands/   Interactive components. The only place client JS originates.
    lib/       Behavior functions and shared utilities.
    public/    Static assets, served as-is.

## Environment

Bun reads `.env` automatically - there is no dotenv dependency.

`.env` was generated with a unique `STONEWARE_CSRF_SECRET` and is gitignored. Set a
different one per environment; `.env.example` is the tracked template.
