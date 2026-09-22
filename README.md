# PlayHub — CrazyGames-style Game Portal (Astro.js)

A CrazyGames-look-alike UI/UX game portal: sidebar categories, hover-preview
thumbnails, hero banner with background video, a game player page that loads
your games in an `<iframe>` by ID, and a "More Games" rail.

## How it works — YOU own the data
No external API calls, no third-party dependency. All game data (including
the iframe URL to your own externally-hosted game) lives in one file you
edit by hand:

**`src/data/games.json`**

Each entry looks like this:
```json
{
  "id": "1001",
  "title": "Moto X3M",
  "category": "Racing",
  "tags": ["bike", "stunt", "racing"],
  "description": "Race through explosive obstacle courses.",
  "instructions": "Arrow keys to drive, Space for tricks.",
  "width": 960,
  "height": 540,
  "url": "https://yourgamehost.com/games/moto-x3m/index.html",
  "thumb": "https://yourgamehost.com/thumbs/moto-x3m.jpg",
  "previewVideo": "https://yourgamehost.com/previews/moto-x3m.mp4",
  "plays": 5230000,
  "rating": 4.6,
  "featured": true
}
```
- `"url"` → the iframe src pointing at your game, hosted on your external site.
- `"thumb"` → your thumbnail image.
- `"previewVideo"` → optional short muted looping clip shown on hover (skip this field if you don't have one — the card just won't show a hover preview).
- `"id"` → anything unique; it becomes the page URL `/game/<id>`.

Just add one object per game and rebuild — that's it. `src/lib/gamesApi.ts`
reads this file and exposes `getGameById(id)`, `getAllGames()`,
`getGamesByCategory()`, etc. to the rest of the app; no other file needs to
change when you add games.

## Getting started
```bash
npm install
npm run dev
```
Then edit `src/data/games.json` with your real games — the site updates on
save in dev mode.

Before going live, also update:
- `astro.config.mjs` → `image.domains`: add the actual domain(s) your
  thumbnails are hosted on (required for Astro's image optimizer to process
  remote images).
- `src/layouts/BaseLayout.astro` → the `<link rel="preconnect">` tag: point
  it at your actual game-hosting domain.

## Where things live
- `src/data/games.json` — **your game catalog, edit this**
- `src/lib/gamesApi.ts` — reads/normalizes `games.json`, exposes helper functions
- `src/pages/index.astro` — homepage (hero + per-category rows)
- `src/pages/category/[slug].astro` — one page per category
- `src/pages/game/[id].astro` — the actual game/player page (iframe by id)
- `src/pages/search.astro` + `src/pages/games-index.json.ts` — client-side
  instant search (no server needed)
- `src/components/GameCard.astro` — thumbnail + hover preview video
- `src/components/HeroBanner.astro` — top banner with background video
- `src/styles/global.css` — all layout/theme/responsive CSS

## Why this hits 90+ on Core Web Vitals (mobile included)
1. **Static output (`output: "static"`)** — every page is plain pre-rendered
   HTML from `games.json` at build time; no server work at request time.
2. **Zero JS framework** — no React/Vue runtime shipped. The only client JS
   is ~2 tiny vanilla scripts (hover-preview + click-to-play), so Total
   Blocking Time / INP stay very low.
3. **Click-to-play iframe** — your game is never requested until the user
   clicks Play, so its weight can't hurt your LCP/TBT.
4. **`astro:assets` `<Image>`** — thumbnails are resized/compressed
   (WebP/AVIF) at build time instead of shipping your raw images as-is.
5. **Reserved aspect-ratio boxes** on every thumbnail/hero/player container
   — this is what keeps Cumulative Layout Shift near zero.
6. **Hover/preview videos use `preload="none"`** and only get a `src` on
   real interaction (hover/focus/touch), so no video bytes download on page
   load, and the hero video is deferred to `requestIdleCallback`.
7. **`prefetch`** — Astro prefetches game-detail links on viewport/hover so
   navigation feels instant, without you writing a router.
8. **`<link rel="preconnect">`** to your game-hosting domain — set this to
   your real domain (see above) so thumbnail/video requests start earlier.

Run `npm run build && npm run preview`, then audit with Lighthouse
(mobile + throttled) to confirm. Real scores will also depend on how heavy
your actual game files/thumbnails are, since that's outside this app's
control — keep thumbnails compressed and games' own JS/assets lean.

## Deploying (GitHub Pages, fully automated)
A ready-to-go workflow lives at `.github/workflows/deploy.yml`. It builds the
site with Astro and publishes `dist/` to GitHub Pages on every push to `main`.

Setup steps:
1. Push this project to the `ayushmancarddownload/ayushmancarddownload.github.io` repo.
2. In the repo → **Settings → Pages → Build and deployment → Source**, select
   **GitHub Actions** (NOT "Deploy from a branch" — leaving it on the branch
   option makes GitHub auto-run its own Jekyll build instead of our
   workflow, which will fail trying to parse `.astro` files as Jekyll
   pages/front-matter).
3. Push to `main` — the **Deploy to GitHub Pages** workflow runs
   automatically and publishes to `https://ayushmancarddownload.github.io`
   (no `base` path needed — this is the special root user-pages repo).

A `public/.nojekyll` file is also included as a safety net so GitHub never
tries to run Jekyll over the build output even if the branch-deploy method
is ever used instead.

You can also deploy the same `dist/` output to Vercel, Netlify, or
Cloudflare Pages instead if you prefer — the workflow only targets GitHub
Pages, but the build step (`npm run build`) is identical everywhere.

### package-lock.json
Already committed on your end (`npm install` was run locally) — the CI
workflow uses `npm ci` with that lockfile automatically, and `cache: "npm"`
in `deploy.yml` speeds up repeat builds using it.
