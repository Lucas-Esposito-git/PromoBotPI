import "server-only";
import { z } from "zod";
import { DatabaseError, supabaseRequest } from "../database/supabase";
import type { CriarPromocaoDTO } from "../dtos/criar.promocao.dto";
import type { AtualizarPromocaoDto } from "../dtos/atualizar-promocao.dto";
const columns="id,fonte,moeda,preco_normal,preco_promocional,url,criado_em,atualizado_em,jogo:jogos(id,chave_externa,titulo),loja:lojas(id,nome,tipo)";
export const OfertaSalvaSchema=z.object({
 id:z.string().uuid(),fonte:z.string(),moeda:z.enum(["BRL","USD"]),preco_normal:z.number().nullable(),preco_promocional:z.number(),url:z.string(),criado_em:z.string(),atualizado_em:z.string(),
 jogo:z.object({id:z.string().uuid(),chave_externa:z.string(),titulo:z.string()}),
 loja:z.object({id:z.string().uuid(),nome:z.string(),tipo:z.enum(["loja","agregador"])}),
});
export type OfertaSalva=z.infer<typeof OfertaSalvaSchema>;
export async function listarSalvas(page=0) {
 const query=new URLSearchParams({select:columns,order:"atualizado_em.desc,id.desc",limit:"21",offset:String(page*20)});
 const data=z.array(OfertaSalvaSchema).parse(await supabaseRequest(`ofertas?${query}`));
 return {ofertas:data.slice(0,20),page,hasMore:data.length>20};
}
export async function buscarSalva(id:string) {
 const query=new URLSearchParams({select:columns,id:`eq.${id}`});
 const data=z.array(OfertaSalvaSchema).parse(await supabaseRequest(`ofertas?${query}`));
 if (!data[0]) throw new DatabaseError("Oferta não encontrada.",404);
 return data[0];
}
export async function salvarOferta(dto:CriarPromocaoDTO) {
 const id=z.string().uuid().parse(await supabaseRequest("rpc/promobot_salvar_oferta",{method:"POST",body:JSON.stringify({p_dados:dto})}));
 return buscarSalva(id);
}
export async function atualizarOferta(id:string,dto:AtualizarPromocaoDto) {
 const values: Record<string,unknown>={};
 if(dto.precoPromocional!==undefined)values.preco_promocional=dto.precoPromocional;
 if(dto.precoNormal!==undefined)values.preco_normal=dto.precoNormal;
 if(dto.url!==undefined)values.url=dto.url;
 const query=new URLSearchParams({id:`eq.${id}`,select:columns});
 const rows=z.array(OfertaSalvaSchema).parse(await supabaseRequest(`ofertas?${query}`,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify(values)}));
 if(!rows[0])throw new DatabaseError("Oferta não encontrada.",404);
 return rows[0];
}
export async function excluirOferta(id:string) {
 const query=new URLSearchParams({id:`eq.${id}`,select:"id"});
 const rows=z.array(z.object({id:z.string()})).parse(await supabaseRequest(`ofertas?${query}`,{method:"DELETE",headers:{Prefer:"return=representation"}}));
 if(!rows[0])throw new DatabaseError("Oferta não encontrada.",404);
}
