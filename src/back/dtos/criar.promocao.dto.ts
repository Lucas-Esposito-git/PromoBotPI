import { z } from "zod";
export const PrecoSchema = z.number().finite().min(0).max(9999999999.99)
  .refine(value => Math.abs(value*100-Math.round(value*100)) < 0.0001, "Use até duas casas decimais.");
export const UrlOfertaSchema = z.string().url().max(2048).refine(value => ["https:","http:"].includes(new URL(value).protocol), "URL HTTP/HTTPS obrigatória.");
export const CriarPromocaoSchema = z.object({
  chaveExterna: z.string().trim().min(1).max(150),
  titulo: z.string().trim().min(1).max(250),
  loja: z.object({ nome:z.string().trim().min(1).max(100), tipo:z.enum(["loja","agregador"]).default("loja") }).strict(),
  fonte: z.enum(["steam","ggdeals","cheapshark","gamerpower"]),
  moeda: z.enum(["BRL","USD"]),
  precoPromocional: PrecoSchema,
  precoNormal: PrecoSchema.nullable(),
  url: UrlOfertaSchema,
}).strict().refine(value => value.precoNormal === null || value.precoNormal >= value.precoPromocional, "Preço normal não pode ser menor que o promocional.");
export type CriarPromocaoDTO = z.infer<typeof CriarPromocaoSchema>;
