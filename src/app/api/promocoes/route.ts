import { z } from "zod";
import { listarSalvas, salvarOferta } from "@/back/repositories/promocao.repository";
import { CriarPromocaoSchema } from "@/back/dtos/criar.promocao.dto";
import { requireAdmin, bodyJson, dbResponseError } from "@/back/services/promocao-db.service";
export async function GET(request:Request) {
 try {
 const raw=new URL(request.url).searchParams.get("page") ?? "0";
 const page=z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0).max(10000)).parse(raw);
 return Response.json(await listarSalvas(page),{headers:{"Cache-Control":"no-store"}});
 }catch(error){return dbResponseError(error);}
}
export async function POST(request:Request) {
 try {requireAdmin(request);const dto=CriarPromocaoSchema.parse(await bodyJson(request));return Response.json(await salvarOferta(dto),{status:200});}
 catch(error){return dbResponseError(error);}
}
