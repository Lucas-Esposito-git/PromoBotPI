import { listarPromocoes } from "@/back/controllers/promocao.controller";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);

        const promocoes = await listarPromocoes(
            url.searchParams
        );

        return Response.json(promocoes, {
            status: 200,
        });
    } catch (error) {
        console.error("Erro ao listar promoções:", error);

        return Response.json(
            {
                error: "Não foi possível buscar promoções.",
            },
            {
                status: 502,
            }
        );
    }
}