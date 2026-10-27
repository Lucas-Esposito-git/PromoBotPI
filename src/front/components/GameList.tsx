
"use client";

import { useState } from "react";
import GameCard from "./GameCard";
import { useGames } from "../hooks/useGames";

type SortOption =
  | "discount"
  | "lowest-price"
  | "highest-price"
  | "name";

export default function GameList() {
  const { games, loading } = useGames();

  const [selectedStore, setSelectedStore] = useState("Todas");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [minDiscount, setMinDiscount] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("discount");

  const stores = [
    "Todas",
    ...new Set(games.map((game) => game.store)),
  ];

  const genres = [
    "Todos",
    ...new Set(games.map((game) => game.genre)),
  ];

  const getDiscount = (original: number, current: number) =>
    original > 0
      ? Math.round(((original - current) / original) * 100)
      : 0;

  const filteredGames = games
    .filter((game) => {
      const matchesStore =
        selectedStore === "Todas" ||
        game.store === selectedStore;

      const matchesGenre =
        selectedGenre === "Todos" ||
        game.genre === selectedGenre;

      const matchesDiscount =
        getDiscount(game.originalPrice, game.promotionalPrice) >=
        minDiscount;

      return matchesStore && matchesGenre && matchesDiscount;
    })
    .sort((a, b) => {
      if (sortBy === "lowest-price") {
        return a.promotionalPrice - b.promotionalPrice;
      }

      if (sortBy === "highest-price") {
        return b.promotionalPrice - a.promotionalPrice;
      }

      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      }

      return (
        getDiscount(b.originalPrice, b.promotionalPrice) -
        getDiscount(a.originalPrice, a.promotionalPrice)
      );
    });

  return (
    <section className="games-section">
      <div className="section-heading">
        <h2 className="section-title">Catálogo</h2>
        <span className="games-count">
          {filteredGames.length} jogos encontrados
        </span>
      </div>

      <div className="games-filters">
        <div className="filter-group">
          <span className="filter-label">Lojas</span>

          <div className="filter-options">
            {stores.map((store) => (
              <button
                key={store}
                type="button"
                className={`filter-button ${
                  selectedStore === store ? "active" : ""
                }`}
                onClick={() => setSelectedStore(store)}
              >
                {store === "Todas" ? "Todas as Lojas" : store}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Gêneros</span>

          <div className="filter-options">
            {genres.map((genre) => (
              <button
                key={genre}
                type="button"
                className={`filter-button ${
                  selectedGenre === genre ? "active" : ""
                }`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre === "Todos" ? "Todos os Gêneros" : genre}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Desconto</span>

          <div className="filter-options">
            {[0, 25, 50, 70, 80].map((discount) => (
              <button
                key={discount}
                type="button"
                className={`filter-button ${
                  minDiscount === discount ? "active" : ""
                }`}
                onClick={() => setMinDiscount(discount)}
              >
                {discount === 0
                  ? "Qualquer desconto"
                  : `${discount}%+`}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="game-sort">
            Ordenar por
          </label>

          <select
            id="game-sort"
            className="games-sort"
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as SortOption)
            }
          >
            <option value="discount">Maior desconto</option>
            <option value="lowest-price">Menor preço</option>
            <option value="highest-price">Maior preço</option>
            <option value="name">Nome A-Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="games-message">Carregando jogos...</p>
      ) : filteredGames.length === 0 ? (
        <p className="games-message">
          Nenhum jogo encontrado com esses filtros.
        </p>
      ) : (
        <div className="games-grid">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </section>
  );
}
