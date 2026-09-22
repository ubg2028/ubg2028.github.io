export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructions?: string;
  category: string;
  tags: string[];
  width: number;
  height: number;
  /** Direct URL the <iframe> src will point to for actually playing the game */
  playUrl: string;
  /** Static thumbnail shown by default on cards */
  thumbnail: string;
  /** Short muted looping preview clip shown on hover (CrazyGames-style) */
  previewVideo?: string;
  plays?: number;
  rating?: number;
  featured?: boolean;
}

export interface GamesApiResponse {
  games: Game[];
  total: number;
}
