// ================= CENTRAL GAMES DATA HELPERS =================
// Every page (home, category pages, game pages) reads from this single
// source of truth: src/data/games.json. Add a new game by adding a new
// object to that file — a new /games/<slug>/ page is generated
// automatically at build time, no new .astro file needed.

import gamesData from '../data/games.json';

/** Turn "Dress Up" -> "dress-up" (used for category URLs) */
export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
}

/** All games, in JSON order */
export function getAllGames() {
  return gamesData;
}

/** A single game by its slug, or undefined */
export function getGameBySlug(slug) {
  return gamesData.find((g) => g.slug === slug);
}

/** Unique categories with a URL-safe slug + count, sorted by popularity */
export function getCategories() {
  const map = new Map();
  for (const g of gamesData) {
    const slug = slugify(g.category);
    if (!map.has(slug)) {
      map.set(slug, { name: g.category, slug, count: 0 });
    }
    map.get(slug).count += 1;
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

/** All games belonging to a given category slug */
export function getGamesByCategorySlug(categorySlug) {
  return gamesData.filter((g) => slugify(g.category) === categorySlug);
}

/** Featured / hero-worthy games (falls back to the first game) */
export function getFeaturedGame() {
  return gamesData.find((g) => g.featured) || gamesData[0];
}

/**
 * Related games for a game detail page: same category first,
 * then fill the rest with other games so the grid is never empty.
 */
export function getRelatedGames(game, limit = 12) {
  const sameCategory = gamesData.filter(
    (g) => g.slug !== game.slug && g.category === game.category
  );
  const others = gamesData.filter(
    (g) => g.slug !== game.slug && g.category !== game.category
  );
  return [...sameCategory, ...others].slice(0, limit);
}
