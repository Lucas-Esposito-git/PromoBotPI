export type CatalogSource = "all" | "steam" | "br" | "usd" | "free";

export interface GameOffer {
  store: string;
  price: number;
  originalPrice: number | null;
  url: string;
}
export interface Game {
  id: number;
  title: string;
  store: string;
  genre: string;
  image: string;
  originalPrice: number | null;
  promotionalPrice: number;
  description: string;
  rating: number | null;
  tags: string[];
  offers: GameOffer[];
  featuredRank?: number;
  currency?: "USD" | "BRL";
  historicalLow?: number | null;
  source?: CatalogSource;
}
export type CatalogCursor = { steam: number | null; br: number | null; free: number | null };
export interface CatalogPage {
  games: Game[];
  page: number;
  hasMore: boolean;
  source: CatalogSource;
  omitted: number;
  nextCursor?: CatalogCursor;
  warnings?: string[];
}
export const gameKey = (game: Game) => `${game.source === "free" ? "free" : game.currency === "BRL" ? "app" : "cheap"}:${game.id}`;
// A Steam App ID identifies the same game in Steam and GG.deals. Keep the
// cheapest verified BRL representation; do not invent a store behind GG.deals.
export function preferGame(current: Game | undefined, incoming: Game): Game {
  if (!current) return incoming;
  if (incoming.promotionalPrice < current.promotionalPrice) return incoming;
  if (incoming.promotionalPrice === current.promotionalPrice && incoming.source === "steam") return incoming;
  return current;
}
export const discountPercent = (original: number | null, promotional: number) =>
  original !== null && original > 0 ? Math.max(0, Math.round((1 - promotional / original) * 100)) : 0;
export const money = (value: number, currency: "BRL" | "USD" = "USD") =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
export const usd = (value: number) => money(value, "USD");
