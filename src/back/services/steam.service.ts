import { z } from "zod";
import type { CatalogPage, Game } from "@/front/services/games";
import { CatalogError } from "./catalogo-br.service";
const PAGE_SIZE = 25;
const searchSchema = z.object({ success: z.union([z.literal(1), z.literal(true)]), results_html: z.string(), start: z.number().int().nonnegative(), total_count: z.number().int().nonnegative() });
const decodeText = (value: string) => value.replace(/<[^>]*>/g, "").replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (whole, entity: string) => {
  const named: Record<string,string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
  if (!entity.startsWith("#")) return named[entity.toLowerCase()] ?? whole;
  const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2),16) : parseInt(entity.slice(1),10);
  return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
}).trim();
function textOf(html: string, className: string) {
  return decodeText(html.match(new RegExp(`<[^>]+class="[^"]*\\b${className}\\b[^"]*"[^>]*>([\\s\\S]*?)<\\/`, "i"))?.[1] ?? "");
}
function brl(value: string): number | null {
  if (!/^R\$\s*[\d.]+,\d{2}$/.test(value)) return null;
  const parsed = Number(value.replace(/^R\$\s*/, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
// The storefront returns an HTML fragment inside JSON. Keep this parser isolated,
// check the BR currency and numerical price, and fail rather than invent prices.
export function parseSteamRows(html: string): { games: Game[]; rows: number } {
  const rows = [...html.matchAll(/<a\b([^>]*\bclass="[^"]*\bsearch_result_row\b[^"]*"[^>]*)>([\s\S]*?)<\/a>/gi)];
  const games = new Map<number,Game>();
  for (const row of rows) {
    const [,attributes,content] = row;
    const idText = attributes.match(/data-ds-appid="(\d+)"/)?.[1];
    const href = attributes.match(/href="([^"]+)"/)?.[1];
    if (!idText || !href || !href.startsWith(`https://store.steampowered.com/app/${idText}/`)) continue;
    const id = Number(idText);
    if (!Number.isSafeInteger(id)) continue;
    const title = textOf(content,"title");
    const originalPrice = brl(textOf(content,"discount_original_price"));
    const promotionalPrice = brl(textOf(content,"discount_final_price"));
    const centsText = content.match(/data-price-final="(\d+)"/)?.[1];
    const image = content.match(/<img[^>]+src="(https:\/\/[^"]+)"/i)?.[1];
    if (!title || !image || originalPrice === null || promotionalPrice === null || !centsText || originalPrice <= promotionalPrice) continue;
    if (Math.round(promotionalPrice * 100) !== Number(centsText)) continue;
    const url = `https://store.steampowered.com/app/${id}/`;
    games.set(id, { id, title, store: "Steam", genre: "PC", image: decodeText(image),
      originalPrice, promotionalPrice, currency: "BRL", source: "steam", rating: null, tags: ["PC", "Steam", "Brasil"],
      description: "Promoção da loja Steam para a região Brasil. Confira o valor e as condições na página do jogo.",
      offers: [{ store: "Steam", price: promotionalPrice, originalPrice, url }],
    });
  }
  return { games: [...games.values()], rows: rows.length };
}
export async function consultarSteam(title: string, page: number): Promise<CatalogPage> {
  const query = new URLSearchParams({ term: title.trim(), page: String(page + 1), start: String(page * PAGE_SIZE), count: String(PAGE_SIZE), specials: "1", category1: "998", infinite: "1", cc: "br", l: "brazilian", supportedlang: "", filter: "", hidef2p: "1" });
  const response = await fetch(`https://store.steampowered.com/search/results/?${query}`, {
    signal: AbortSignal.timeout(15000), next: { revalidate: 300 }, headers: { "User-Agent": "PromoBotPI/1.0" },
  });
  if (response.status === 429) throw new CatalogError("A Steam limitou as consultas. Aguarde antes de tentar novamente.",429);
  if (!response.ok) throw new CatalogError("Não foi possível consultar as promoções da Steam.",502);
  const parsed = searchSchema.safeParse(await response.json());
  if (!parsed.success) throw new CatalogError("A Steam retornou um formato inesperado.",502);
  if (parsed.data.start !== page * PAGE_SIZE) throw new CatalogError("A Steam não retornou a página solicitada. Tente novamente mais tarde.",502);
  const {games,rows} = parseSteamRows(parsed.data.results_html);
  if (parsed.data.results_html.trim() && games.length === 0 && parsed.data.total_count > page * PAGE_SIZE) {
    throw new CatalogError("Não foi possível validar os preços BRL da Steam. A interface da loja pode ter mudado.",502);
  }
  games.slice().sort((a,b) => (1-b.promotionalPrice/b.originalPrice!)-(1-a.promotionalPrice/a.originalPrice!))
    .slice(0,3).forEach((game,index) => {game.featuredRank=index+1;});
  return {games,page,source:"steam",hasMore:(page+1)*PAGE_SIZE < parsed.data.total_count,omitted:Math.max(0,rows-games.length)};
}
