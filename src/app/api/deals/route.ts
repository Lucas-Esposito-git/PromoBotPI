import { z } from "zod";

const PromocaoSchema = z.object({
    internalName: z.string(),
    title: z.string(),
    dealID: z.string(),
    storeID: z.string(),
    gameID: z.string(),
    salePrice: z.string(),
    normalPrice: z.string(),
    isOnSale: z.enum(["0", "1"]),
    savings: z.string(),
    metacriticScore: z.string(),
    steamRatingText: z.string(),
    steamRatingPercent: z.string(),
    steamRatingCount: z.string(),
    steamAppID: z.string(),
    releaseDate: z.number(),
    lastChange: z.number(),
    dealRating: z.string(),
    thumb: z.string(),
});

const ListaPromocoesResponseSchema = z.array(PromocaoSchema);

const CHEAPSHARK_API = 
    "https://www.cheapshark.com/api/1.0";

     export async function buscarPromocoes(
        parametros: URLSearchParams = new URLSearchParams
     ) {
       const query = parametros.toString();
       const url = query
           ? `${CHEAPSHARK_API}/deals?${query}`
           : `${CHEAPSHARK_API}/deals`;

           const response = await fetch(url);

           if (!response.ok) {
            throw new Error(
                `Erro ao consultar a promoção: ${response.status}`
            );
           }

           const data: unknown = await response.json();
           const resultado = 
                ListaPromocoesResponseSchema.safeParse(data);

            if (!resultado.success) {
                console.error(
                    "Resposta inválida da cheapShark:",
                    "A API retornou promoções em formato inválido."
                );
            }

            return resultado.data;

     }

