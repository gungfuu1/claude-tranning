# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Next.js version warning

This project runs **Next.js 16.4.3 / React 19.3**, which has breaking changes relative to older Next.js versions. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (`01-app/` for App Router guides and API reference, `01-app/04-glossary.md` for terms) and heed deprecation notices rather than relying on prior knowledge.

## Commands

- `npm run dev` — dev server at http://localhost:3000 (Turbopack)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)
- `npx next typegen && npx tsc --noEmit` — type-check without a full build (`typegen` generates the global route type helpers such as `LayoutProps`/`PageProps` into `.next/`; `dev` and `build` also generate them)

No test runner is configured yet.

## Architecture

Freshly bootstrapped App Router project (`create-next-app`); source lives under `src/`, with `@/*` aliased to `./src/*`.

Key configuration in `next.config.ts` that shapes how code must be written:

- **`cacheComponents: true`** — the Cache Components model is on. Caching is opt-in via the `'use cache'` directive (plus `'use cache: private'` / `'use cache: remote'` variants); uncached dynamic data (cookies, headers, `searchParams`, uncached fetches) must be wrapped in `<Suspense>` so the static shell can prerender. Use `01-app/01-getting-started/08-caching.md`, not the "previous model" guide.
- **`partialPrefetching: true`** — `<Link>` prefetches only the route's App Shell; `<Link prefetch={true}>` opts into per-link prefetching of URL-dependent cached content. Dev overlay surfaces instant-navigation insights; a route can opt out with `export const instant = false`. See `01-app/02-guides/adopting-partial-prefetching.md`.
- **Tailwind CSS v4** is wired through a Turbopack loader rule (`@tailwindcss/turbopack` on `*.css`), not PostCSS. Theme tokens are declared in `src/app/globals.css` via `@import "tailwindcss"` and `@theme inline` (CSS variables `--background`/`--foreground`, dark mode via `prefers-color-scheme`).

The root layout (`src/app/layout.tsx`) uses the globally typed `LayoutProps<"/">` helper for props, loads IBM Plex Sans Thai (mapped to `--font-sans`) and Geist Mono via `next/font/google`, and wraps every page in `SiteHeader`/`SiteFooter`. UI text is Thai (`lang="th"`); PEA brand colors are theme tokens in `globals.css` (`pea-primary`, `pea-primary-dark`, `pea-accent`).

### Data (Supabase)

Course data lives in Supabase (`.env.local` holds `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). Schema is in `supabase/migrations/` (table `courses` plus views `course_stats` and `course_categories`, RLS read-only for `anon`) and sample rows in `supabase/seed.sql`; there is no Supabase CLI setup, so schema changes are applied by running the SQL in the dashboard SQL editor.

Three Supabase clients in `src/lib/supabase/`, chosen by what the code depends on:
- `public.ts` — cookie-less; the only one usable inside `'use cache'` functions. `src/lib/courses.ts` uses it, with `cacheLife("minutes")` and `cacheTag(COURSES_TAG)` (call `revalidateTag` with it after writes).
- `server.ts` — reads `cookies()` for per-user data; callers must be uncached and inside `<Suspense>`.
- `client.ts` — browser client for Client Components.

`middleware.ts` (`updateSession`) is not wired into a `src/proxy.ts` yet — it redirects every signed-out request to `/auth/login`, so public routes must be allowed first. Supabase query errors are thrown, so a missing table fails `next build` during prerender. Hero slides (`src/lib/hero-slides.ts`) are still static in code. Hero images are remote Unsplash URLs; `images.remotePatterns` in `next.config.ts` pins the exact `search` query, so it must change in step with the `unsplash()` helper.
