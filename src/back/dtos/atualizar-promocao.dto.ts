import { z } from "zod";
import { CriarPromocaoSchema } from "./criar.promocao.dto";

export const AtualizarPromocaoSchema = 
CriarPromocaoSchema.partial();

export type AtualizarPromocaoDto = z.infer<typeof AtualizarPromocaoSchema>;
