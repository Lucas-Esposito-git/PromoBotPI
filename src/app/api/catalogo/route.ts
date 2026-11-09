import { z } from "zod";
import { consultarTodos } from "@/back/services/catalogo-todos.service";
import { consultarSteam } from "@/back/services/steam.service";
import { consultarGratis } from "@/back/services/gamerpower.service";
import { consultarCatalogo } from "@/back/services/catalogo.service";
import { CatalogError, consultarCatalogoBR } from "@/back/services/catalogo-br.service";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const title = params.get("title") ?? "";
  const rawPage = params.get("page") ?? "0";
  const source = params.get("source") ?? "all";
  if (title.length > 120 || !/^\d+$/.test(rawPage) || Number(rawPage) > 1000 || !["all", "steam", "br", "usd", "free"].includes(source)) {
    return Response.json({ error: "Parâmetros de consulta inválidos." }, { status: 400 });
  }
  const page = Number(rawPage);
  if (source === "all" && page > 0 && !params.has("cursor")) return Response.json({error:"Use o cursor retornado para carregar a próxima página."},{status:400});
  let cursor;
  if (params.has("cursor")) {
    try {
      const value = z.number().int().min(0).max(2000).nullable();
      cursor = z.object({steam:value,br:value,free:value}).strict().parse(JSON.parse(params.get("cursor")!));
    } catch { return Response.json({error:"Cursor de paginação inválido."},{status:400}); }
  }
  try {
    if (source === "all") return Response.json(await consultarTodos(title,page,cursor));
    if (source === "steam") return Response.json(await consultarSteam(title, page));
    if (source === "free") return Response.json(await consultarGratis(title, page));
    if (source === "br") return Response.json(await consultarCatalogoBR(title, page));
    const data = await consultarCatalogo(title, page);
    return Response.json({ ...data, page, source: "usd", omitted: 0 });
  } catch (error) {
    // Do not log upstream errors: fetch URLs may contain the secret API key.
    return Response.json({ error: error instanceof CatalogError ? error.message : "Não foi possível consultar o catálogo. Tente novamente." },
      { status: error instanceof CatalogError ? error.status : 502 });
  }
}
