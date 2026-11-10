import { z } from "zod";
import { PrecoSchema, UrlOfertaSchema } from "./criar.promocao.dto";
export const AtualizarPromocaoSchema = z.object({
 precoPromocional: PrecoSchema.optional(), precoNormal: PrecoSchema.nullable().optional(), url: UrlOfertaSchema.optional(),
}).strict().refine(value => Object.keys(value).length>0, "Informe ao menos um campo.")
.refine(value => value.precoNormal == null || value.precoPromocional === undefined || value.precoNormal>=value.precoPromocional, "Preços incompatíveis.");
export type AtualizarPromocaoDto = z.infer<typeof AtualizarPromocaoSchema>;
