import { buscarPromocoes } from "@/back/services/games.service";

export async function listarPromocoes(
    parametros: URLSearchParams = new URLSearchParams()
) {
    const promocoes = await buscarPromocoes(parametros);

    return promocoes;
}