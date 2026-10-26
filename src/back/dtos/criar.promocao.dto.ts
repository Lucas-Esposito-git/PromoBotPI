import { z } from "zod";

export const CriarPromocaoSchema = z.object({
    titulo: z.string().min(1),
    precoPromocional: z.number().nonnegative(),
    precoNormal: z.number().nonnegative(),
});

export type CriarPromocaoDTO = z.infer<
     typeof CriarPromocaoSchema
>;