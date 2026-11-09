"use client";

import { useState } from "react";
import GameCard from "./GameCard";
import GameModal from "./GameModal";
import { useGames } from "../hooks/useGames";
import type { Game } from "../services/games.mock";
import { discountPercent } from "../services/games.mock";
import { anton } from "../fonts";

type SortOption = "discount" | "lowest-price" | "highest-price" | "name";

type Props = { search: string };

const buttonBase =
  "rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-purple-400";
const inactive =
  "border-[#2a3142] bg-[#222837] text-[#a2afc5] hover:bg-[#30374a] hover:text-white";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function GameList({ search }: Props) {
  const { games, loading } = useGames();
  const [selectedStore, setSelectedStore] = useState("Todas");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [minDiscount, setMinDiscount] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("discount");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const stores = ["Todas", "Steam", "Epic Games", "GOG", "Nuvem", "Rockstar"]
    .filter((store) => store === "Todas" || games.some((game) => game.offers.some((offer) => offer.store === store)));
  const genres = ["Todos", "RPG", "Ação", "Aventura", "Plataforma", "Simulação", "Roguelike"]
    .filter((genre) => genre === "Todos" || games.some((game) => game.genre === genre));

  const featured = games
    .filter((game) => game.featuredRank)
    .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0));

  const filteredGames = games
    .filter((game) => {
      const term = normalize(search.trim());
      const matchesSearch = !term || normalize([
        game.title,
        game.genre,
        ...game.tags,
        ...game.offers.map((offer) => offer.store),
      ].join(" ")).includes(term);
      const matchesStore = selectedStore === "Todas" ||
        game.offers.some((offer) => offer.store === selectedStore);
      const matchesGenre = selectedGenre === "Todos" || game.genre === selectedGenre;
      const matchesDiscount = discountPercent(game.originalPrice, game.promotionalPrice) >= minDiscount;
      return matchesSearch && matchesStore && matchesGenre && matchesDiscount;
    })
    .sort((a, b) => {
      if (sortBy === "lowest-price") return a.promotionalPrice - b.promotionalPrice;
      if (sortBy === "highest-price") return b.promotionalPrice - a.promotionalPrice;
      if (sortBy === "name") return a.title.localeCompare(b.title);
      return discountPercent(b.originalPrice, b.promotionalPrice) -
        discountPercent(a.originalPrice, a.promotionalPrice);
    });

  return (
    <>
      <section className="mx-auto max-w-[1280px] px-4 pt-12 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="h-6 w-1 rounded bg-[#ec2388]" />
          <h2 className={`${anton.className} text-[23px] text-white`}>MELHORES OFERTAS</h2>
          <span className="rounded border border-pink-500/25 bg-pink-500/10 px-2.5 py-1 text-sm font-bold text-[#ec2388]">
            70%+ off
          </span>
        </div>
        {loading ? (
          <p className="py-8 text-center text-[#8b95aa]">Carregando ofertas...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((game) => (
              <GameCard key={game.id} game={game} onSelect={setSelectedGame} featured />
            ))}
          </div>
        )}
      </section>

      <section id="catalogo" className="mx-auto max-w-[1280px] px-4 pt-14 sm:px-6">
        <div className="mb-7 flex flex-wrap items-center gap-3">
          <span className="h-6 w-1 rounded bg-[#3b82f6]" />
          <h2 className={`${anton.className} text-[23px] text-white`}>CATÁLOGO</h2>
          <span className="text-sm text-[#647086]">
            {filteredGames.length} jogos encontrados
          </span>
        </div>

        <div className="rounded-xl border border-[#293040] bg-[#191d25] p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex-1 space-y-2.5">
              <div className="flex flex-wrap gap-1.5">
                {stores.map((store) => (
                  <button
                    key={store}
                    type="button"
                    onClick={() => setSelectedStore(store)}
                    aria-pressed={selectedStore === store}
                    className={`${buttonBase} ${selectedStore === store
                      ? "border-[#923ef0] bg-[#923ef0] text-white"
                      : inactive
                      }`}
                  >
                    {store === "Todas" ? "Todas as Lojas" : store}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => setSelectedGenre(genre)}
                    aria-pressed={selectedGenre === genre}
                    className={`${buttonBase} ${selectedGenre === genre
                      ? "border-[#35d2a3] bg-[#35d2a3] text-[#0e1d1a]"
                      : inactive
                      }`}
                  >
                    {genre === "Todos" ? "Todos os Gêneros" : genre}
                  </button>
                ))}
                <span className="mx-1 hidden h-5 w-px bg-[#303647] lg:inline-block" />
                {[0, 25, 50, 70, 80].map((discount) => (
                  <button
                    key={discount}
                    type="button"
                    onClick={() => setMinDiscount(discount)}
                    aria-pressed={minDiscount === discount}
                    className={`${buttonBase} ${minDiscount === discount
                      ? "border-[#e9238d] bg-[#e9238d] text-white"
                      : inactive
                      }`}
                  >
                    {discount === 0 ? "Qualquer desconto" : `${discount}%+`}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full shrink-0 xl:w-[145px]">
              <label htmlFor="game-sort" className="sr-only">Ordenar jogos</label>
              <select
                id="game-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="h-[68px] w-full rounded-lg border border-[#293040] bg-[#222837] px-3 text-xs text-[#a4b0c6] outline-none focus:border-purple-500 xl:h-[68px]"
              >
                <option value="discount">Maior desconto</option>
                <option value="lowest-price">Menor preço</option>
                <option value="highest-price">Maior preço</option>
                <option value="name">Nome A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="py-12 text-center text-[#98a2b5]">Carregando jogos...</p>
        ) : filteredGames.length === 0 ? (
          <p className="py-12 text-center text-[#98a2b5]">
            Nenhum jogo encontrado com esses filtros.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} onSelect={setSelectedGame} />
            ))}
          </div>
        )}
      </section>

      <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />
    </>
  );
}