import { buscarSalva,atualizarOferta,excluirOferta } from "@/back/repositories/promocao.repository";
import { AtualizarPromocaoSchema } from "@/back/dtos/atualizar-promocao.dto";
import { requireAdmin,bodyJson,dbResponseError,IdSchema } from "@/back/services/promocao-db.service";
type Context={params:Promise<{id:string}>};
export async function GET(_request:Request,context:Context) {
 try{return Response.json(await buscarSalva(IdSchema.parse((await context.params).id)),{headers:{"Cache-Control":"no-store"}});}catch(error){return dbResponseError(error);}
}
export async function PATCH(request:Request,context:Context) {
 try{requireAdmin(request);const id=IdSchema.parse((await context.params).id);const dto=AtualizarPromocaoSchema.parse(await bodyJson(request));return Response.json(await atualizarOferta(id,dto));}catch(error){return dbResponseError(error);}
}
export async function DELETE(request:Request,context:Context) {
 try{requireAdmin(request);await excluirOferta(IdSchema.parse((await context.params).id));return new Response(null,{status:204});}catch(error){return dbResponseError(error);}
}
