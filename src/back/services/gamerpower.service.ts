import { z } from "zod";
import type { CatalogPage, Game } from "@/front/services/games";
import { CatalogError } from "./catalogo-br.service";
const link = z.string().url().refine(value => {
  const url = new URL(value);
  return url.protocol === "https:" && ["www.gamerpower.com","gamerpower.com"].includes(url.hostname);
});
const schema = z.array(z.object({ id: z.number().int().positive(), title: z.string(), image: z.string().url(), description: z.string(), platforms: z.string(), status: z.string(), type: z.string(), gamerpower_url: link, open_giveaway_url: link }));
export async function consultarGratis(title: string, page: number): Promise<CatalogPage> {
  const response = await fetch("https://www.gamerpower.com/api/giveaways?type=game&platform=pc", {
    signal: AbortSignal.timeout(15000), next: { revalidate: 300 },
  });
  if (response.status === 201) return {games:[],page,source:"free",hasMore:false,omitted:0};
  if (!response.ok) throw new CatalogError("Não foi possível consultar os jogos grátis na GamerPower.",response.status===429?429:502);
  const data = schema.safeParse(await response.json());
  if (!data.success) throw new CatalogError("A GamerPower retornou um formato inesperado.",502);
  const term = title.trim().toLocaleLowerCase("pt-BR");
  const active = data.data.filter(item => item.status.toLowerCase()==="active" && item.type.toLowerCase()==="game" && (!term || item.title.toLocaleLowerCase("pt-BR").includes(term)));
  const start = page*24;
  const games: Game[] = active.slice(start,start+24).map(item => ({
    id:item.id,title:item.title,store:item.platforms,genre:"PC",image:item.image,
    originalPrice:null,promotionalPrice:0,currency:"BRL",source:"free",rating:null,
    description:item.description,tags:["Grátis",...item.platforms.split(",").map(value=>value.trim())],
    offers:[{store:item.platforms,price:0,originalPrice:null,url:item.open_giveaway_url}],
  }));
  return {games,page,source:"free",hasMore:start+24<active.length,omitted:0};
}
