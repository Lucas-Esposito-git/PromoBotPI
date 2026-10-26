const CHEAPSHARK_API = "https://www.cheapshark.com/api/1.0";

export async function buscarPromocoes(
    parametros: URLSearchParams = new URLSearchParams()
) {
    const query = parametros.toString();

    const url = query
        ? `${CHEAPSHARK_API}/deals?${query}`
        : `${CHEAPSHARK_API}/deals`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Erro ao consultar promoções: ${response.status}`
        );
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
        throw new Error("A API retornou um formato inesperado.");
    }

    return data;
}