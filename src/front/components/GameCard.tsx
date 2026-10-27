
import type { Game } from "../services/games.mock";

type GameCardProps = {
  game: Game;
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function GameCard({ game }: GameCardProps) {
  const discount = Math.round(
    ((game.originalPrice - game.promotionalPrice) /
      game.originalPrice) *
      100
  );

  return (
    <article className="game-card">
      <div className="game-card__image-container">
        <img
          className="game-card__image"
          src={game.image}
          alt={`Capa do jogo ${game.title}`}
        />

        <span className="game-card__discount">
          -{discount}%
        </span>
      </div>

      <div className="game-card__content">
        <h3 className="game-card__title">{game.title}</h3>

        <div className="game-card__prices">
          <div>
            <p className="game-card__original-price">
              {currency.format(game.originalPrice)}
            </p>

            <p className="game-card__promotional-price">
              {currency.format(game.promotionalPrice)}
            </p>
          </div>

          <span className="game-card__store">
            {game.store}
          </span>
        </div>
      </div>
    </article>
  );
}
