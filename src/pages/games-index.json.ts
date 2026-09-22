import type { APIRoute } from "astro";
import { getAllGames } from "../lib/gamesApi";

export const prerender = true;

// A tiny, static JSON file (id/title/category/tags/thumbnail only — no
// description/instructions) so the search page can filter instantly on the
// client without any server round-trip and with a minimal download size.
export const GET: APIRoute = async () => {
  const games = await getAllGames();
  const index = games.map((g) => ({
    id: g.id,
    title: g.title,
    category: g.category,
    tags: g.tags,
    thumbnail: g.thumbnail,
  }));
  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json" },
  });
};
