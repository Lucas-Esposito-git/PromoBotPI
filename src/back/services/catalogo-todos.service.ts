import { consultarSteam } from "./steam.service";
import { consultarCatalogoBR, CatalogError } from "./catalogo-br.service";
import { consultarGratis } from "./gamerpower.service";
import { gameKey, preferGame, type CatalogCursor, type CatalogPage, type Game } from "@/front/services/games";
const initial: CatalogCursor = { steam: 0, br: 0, free: 0 };
export async function consultarTodos(title: string, page: number, cursor: CatalogCursor = initial): Promise<CatalogPage> {
  // Two Steam pages per click increase the initial catalog without using GG quota.
  // Every stream has its own cursor; a failure is retried without skipping pages.
  const jobs: {name: string; source: keyof CatalogCursor; page: number; run: () => Promise<CatalogPage>}[] = [];
  if (cursor.steam !== null) {
    const current = cursor.steam;
    jobs.push({name:"Steam",source:"steam",page:current,run:()=>consultarSteam(title,current)});
    jobs.push({name:"Steam",source:"steam",page:current+1,run:()=>consultarSteam(title,current+1)});
  }
  if (cursor.br !== null) {const current=cursor.br; jobs.push({name:"GG.deals",source:"br",page:current,run:()=>consultarCatalogoBR(title,current)});}
  if (cursor.free !== null) {const current=cursor.free; jobs.push({name:"GamerPower",source:"free",page:current,run:()=>consultarGratis(title,current)});}
  const results = await Promise.allSettled(jobs.map(job=>job.run()));
  const merged = new Map<string,Game>();
  const pools: Record<keyof CatalogCursor, string[]> = {steam:[],br:[],free:[]};
  const next: CatalogCursor = {...cursor};
  const warnings: string[] = [];
  let omitted=0;
  for (const source of ["steam","br","free"] as const) {
    const entries = jobs.map((job,index)=>({job,result:results[index]})).filter(entry=>entry.job.source===source).sort((a,b)=>a.job.page-b.job.page);
    let stopped = false;
    for (const {job,result} of entries) {
      if (result.status === "rejected") {
        if (!stopped) next[source]=job.page;
        stopped=true;
        warnings.push(`${job.name}: ${result.reason instanceof CatalogError ? result.reason.message : "consulta temporariamente indisponível."}`);
        continue;
      }
      // A later page may succeed while an earlier page fails. Keep its cards,
      // but leave the cursor at the failed page so no results are skipped.
      for (const game of result.value.games) {
        if (game.currency !== "BRL") continue;
        const key=gameKey(game);merged.set(key,preferGame(merged.get(key),game));
        pools[source].push(key);
      }
      omitted+=result.value.omitted;
      if (!stopped) {
        next[source]=result.value.hasMore ? job.page+1 : null;
        if (!result.value.hasMore) stopped=true;
      }
    }
  }
  const ordered = new Map<string,Game>();
  for (let index=0; index<Math.max(...Object.values(pools).map(pool=>pool.length)); index++) {
    for (const source of ["steam","br","free"] as const) {
      const key=pools[source][index];
      if (key && !ordered.has(key)) ordered.set(key,merged.get(key)!);
    }
  }
  return {games:[...ordered.values()],page,source:"all",omitted,nextCursor:next,
    hasMore:Object.values(next).some(value=>value!==null),warnings:[...new Set(warnings)]};
}
