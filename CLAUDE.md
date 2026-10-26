# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Next.js version warning

This project runs **Next.js 16.4.3 / React 19.3**, which has breaking changes relative to older Next.js versions. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (`01-app/` for App Router guides and API reference, `04-glossary.md` for terms) and heed deprecation notices rather than relying on prior knowledge.

## Commands

- `npm run dev` — dev server at http://localhost:3000 (Turbopack)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)

No test runner is configured yet.

## Architecture

Freshly bootstrapped App Router project (`create-next-app`); source lives under `src/`, with `@/*` aliased to `./src/*`.

Key configuration in `next.config.ts` that shapes how code must be written:

- **`cacheComponents: true`** — the Cache Components model is on. Caching is opt-in via the `'use cache'` directive (plus `'use cache: private'` / `'use cache: remote'` variants); uncached dynamic data (cookies, headers, `searchParams`, uncached fetches) must be wrapped in `<Suspense>` so the static shell can prerender. Use `01-app/01-getting-started/08-caching.md`, not the "previous model" guide.
- **`partialPrefetching: true`** — `<Link>` prefetches only the route's App Shell; `<Link prefetch={true}>` opts into per-link prefetching of URL-dependent cached content. Dev overlay surfaces instant-navigation insights; a route can opt out with `export const instant = false`. See `01-app/02-guides/adopting-partial-prefetching.md`.
- **Tailwind CSS v4** is wired through a Turbopack loader rule (`@tailwindcss/turbopack` on `*.css`), not PostCSS. Theme tokens are declared in `src/app/globals.css` via `@import "tailwindcss"` and `@theme inline` (CSS variables `--background`/`--foreground`, dark mode via `prefers-color-scheme`).

The root layout (`src/app/layout.tsx`) uses the globally typed `LayoutProps<"/">` helper for props and loads Geist fonts via `next/font/google`.
