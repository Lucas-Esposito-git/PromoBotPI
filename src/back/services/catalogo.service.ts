import { z } from "zod";
import type { Game } from "@/front/services/games";
import { discountPercent } from "@/front/services/games";
const base = "https://www.cheapshark.com/api/1.0";
const money = z.string().regex(/^\d+(?:\.\d+)?$/).transform(Number).refine(Number.isFinite);
const dealSchema = z.object({
  gameID: z.string().regex(/^\d+$/), title: z.string(), dealID: z.string(),
  storeID: z.string(), salePrice: money, normalPrice: money, thumb: z.string().url(),
  steamRatingPercent: z.string().optional(), steamRatingCount: z.string().optional(),
});
const storesSchema = z.array(z.object({ storeID: z.string(), storeName: z.string() }));
async function get(path: string): Promise<unknown> {
  const response = await fetch(`${base}/${path}`, {
    headers: { "User-Agent": "PromoBotPI/1.0" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`CheapShark: ${response.status}`);
  return response.json();
}
export async function consultarCatalogo(title: string, page = 0): Promise<{ games: Game[]; hasMore: boolean }> {
  const query = new URLSearchParams({ pageSize: "30", pageNumber: String(page), onSale: "1", sortBy: "Deal Rating" });
  if (title.trim()) query.set("title", title.trim());
  const [rawDeals, rawStores] = await Promise.all([get(`deals?${query}`), get("stores")]);
  const deals = z.array(dealSchema).parse(rawDeals);
  const stores = new Map(storesSchema.parse(rawStores).map(store => [store.storeID, store.storeName]));
  const grouped = new Map<number, Game>();
  for (const deal of deals) {
    const id = Number(deal.gameID);
    if (!Number.isSafeInteger(id)) continue;
    const store = stores.get(deal.storeID) ?? `Loja ${deal.storeID}`;
    // dealID is supplied URL-encoded by CheapShark; avoid double encoding it.
    const url = `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(decodeURIComponent(deal.dealID))}`;
    const offer = { store, price: deal.salePrice, originalPrice: deal.normalPrice, url };
    let game = grouped.get(id);
    if (!game) {
      game = { id, title: deal.title, store, genre: "PC", image: deal.thumb,
        originalPrice: deal.normalPrice, promotionalPrice: deal.salePrice,
        description: "Oferta para PC encontrada na CheapShark. Confira região e condições na loja.",
        rating: null, tags: ["PC"], offers: [] };
      grouped.set(id, game);
    }
    const existing = game.offers.findIndex(item => item.store === store);
    if (existing < 0) game.offers.push(offer);
    else if (offer.price < game.offers[existing].price) game.offers[existing] = offer;
    if (offer.price < game.promotionalPrice) {
      game.promotionalPrice = offer.price;
      game.originalPrice = offer.originalPrice;
      game.store = store;
    }
  }
  const games = [...grouped.values()];
  games.filter(game => discountPercent(game.originalPrice, game.promotionalPrice) >= 70)
    .sort((a, b) => discountPercent(b.originalPrice, b.promotionalPrice) - discountPercent(a.originalPrice, a.promotionalPrice))
    .slice(0, 3).forEach((game, index) => { game.featuredRank = index + 1; });
  return { games, hasMore: deals.length === 30 };
}
