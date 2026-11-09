import { z } from "zod";
import type { CatalogPage, Game } from "@/front/services/games";

export class CatalogError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
const price = z.string().regex(/^\d+(?:\.\d+)?$/).transform(Number).refine(Number.isFinite);
const ggItemSchema = z.object({
  title: z.string(),
  url: z.string().url().refine(value => {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "gg.deals" || url.hostname === "www.gg.deals");
  }),
  prices: z.object({ currentRetail: price.nullable(), historicalRetail: price.nullable(), currency: z.string() }),
});
type GGItem = z.infer<typeof ggItemSchema>;
const responseSchema = z.object({ success: z.literal(true), data: z.record(z.string(), ggItemSchema.nullable()) });
const discoverySchema = z.array(z.object({
  gameID: z.string(), title: z.string(), thumb: z.string().url(),
  steamAppID: z.string().nullable().optional(),
}));
// Warm-instance cache reduces duplicate IDs between pages; fetch revalidation also
// caches identical batches in Next. A shared database cache is needed at larger scale.
const cache = new Map<string, { expires: number; value: GGItem | null }>();
const pending = new Map<string, Promise<Record<string, GGItem | null>>>();
const TTL = 60 * 60 * 1000;
async function pricesFor(ids: string[], key: string): Promise<Record<string, GGItem | null>> {
  const now = Date.now();
  const result: Record<string, GGItem | null> = {};
  const missing = ids.filter(id => {
    const entry = cache.get(id);
    if (entry && entry.expires > now) { result[id] = entry.value; return false; }
    return true;
  });
  if (!missing.length) return result;
  const batch = missing.slice().sort((a,b) => Number(a)-Number(b)).join(",");
  let request = pending.get(batch);
  if (!request) {
    request = (async () => {
      const query = new URLSearchParams({ ids: batch, region: "br", key });
      const response = await fetch(`https://api.gg.deals/v1/prices/by-steam-app-id/?${query}`, {
        signal: AbortSignal.timeout(15000), next: { revalidate: 3600 },
      });
      if (response.status === 429) throw new CatalogError("Limite da GG.deals atingido. Aguarde alguns minutos antes de tentar novamente.", 429);
      if (response.status === 401 || response.status === 403) throw new CatalogError("A chave da GG.deals não foi aceita. Confira GG_DEALS_API_KEY no servidor.", 502);
      if (!response.ok) throw new CatalogError("Não foi possível consultar os preços brasileiros na GG.deals.", 502);
      const parsed = responseSchema.safeParse(await response.json());
      if (!parsed.success) throw new CatalogError("A GG.deals retornou um formato inesperado.", 502);
      for (const id of missing) cache.set(id, { expires: Date.now() + TTL, value: parsed.data.data[id] ?? null });
      for (const [id, entry] of cache) if (entry.expires <= Date.now()) cache.delete(id);
      while (cache.size > 2000) cache.delete(cache.keys().next().value!);
      return parsed.data.data;
    })();
    pending.set(batch, request);
  }
  try {
    const data = await request;
    for (const id of missing) result[id] = data[id] ?? null;
    return result;
  } finally { pending.delete(batch); }
}
export async function consultarCatalogoBR(title: string, page = 0): Promise<CatalogPage> {
  const key = process.env.GG_DEALS_API_KEY?.trim();
  if (!key) throw new CatalogError("Configure GG_DEALS_API_KEY no .env.local (ou nas variáveis da Vercel) e reinicie o servidor.", 503);
  const query = new URLSearchParams({ pageSize: "30", pageNumber: String(page), onSale: "1", sortBy: "Deal Rating" });
  if (title.trim()) query.set("title", title.trim());
  // CheapShark discovers candidates only. Its USD prices are never converted or
  // attached to the Brazilian prices, and US discounts do not imply BR discounts.
  const response = await fetch(`https://www.cheapshark.com/api/1.0/deals?${query}`, {
    headers: { "User-Agent": "PromoBotPI/1.0" }, signal: AbortSignal.timeout(15000), next: { revalidate: 300 },
  });
  if (!response.ok) throw new CatalogError("Não foi possível descobrir jogos na CheapShark.", 502);
  const deals = discoverySchema.parse(await response.json());
  const candidates = new Map<string, (typeof deals)[number]>();
  const allGames = new Set(deals.map(deal => deal.gameID));
  for (const deal of deals) if (deal.steamAppID && /^[1-9]\d*$/.test(deal.steamAppID)) candidates.set(deal.steamAppID, deal);
  const data = await pricesFor([...candidates.keys()], key);
  const games: Game[] = [];
  for (const [id, candidate] of candidates) {
    const item = data[id];
    if (!item || item.prices.currency !== "BRL" || item.prices.currentRetail === null) continue;
    const numericId = Number(id);
    if (!Number.isSafeInteger(numericId)) continue;
    games.push({ id: numericId, title: item.title, store: "Lojas oficiais", genre: "PC", image: candidate.thumb,
      currency: "BRL", source: "br", originalPrice: null, promotionalPrice: item.prices.currentRetail,
      historicalLow: item.prices.historicalRetail,
      description: "Menor preço nas lojas oficiais monitoradas pela GG.deals para a região Brasil. Disponibilidade e condições devem ser conferidas no comparador.",
      rating: null, tags: ["PC", "Brasil"],
      offers: [{ store: "Lojas oficiais", price: item.prices.currentRetail, originalPrice: null, url: item.url }],
    });
  }
  return { games, page, hasMore: deals.length === 30, source: "br", omitted: Math.max(0, allGames.size - games.length) };
}
