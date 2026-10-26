import { z } from "zod";

export const PromocaoResponseSchema = z.object({
    dealID: z.string(),
    title: z.string(),
    salePrice: z.string(),
    normalPrice: z.string(),
    savings: z.string(),
    storeID: z.string(),
    thumb: z.string(),
});

export const ListaPromocoesResponseSchema = z.array(
    PromocaoResponseSchema
);

export type PromocaoResponseDTO = z.infer<
    typeof PromocaoResponseSchema
>;

export type ListaPromocoesResponseDTO = z.infer<
    typeof ListaPromocoesResponseSchema
>;