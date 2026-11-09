"use client";

import type { Game } from "../services/games";
import { money, discountPercent } from "../services/games";
import { anton } from "../fonts";

type Props = {
  game: Game;
  onSelect: (game: Game) => void;
  featured?: boolean;
};

export default function GameCard({ game, onSelect, featured = false }: Props) {
  const discount = discountPercent(game.originalPrice, game.promotionalPrice);

  if (featured) {
    return (
      <button
        type="button"
        onClick={() => onSelect(game)}
        className="group relative h-[185px] w-full overflow-hidden rounded-xl border border-[#2a3041] bg-[#191d26] text-left transition hover:border-purple-500 focus-visible:outline-2 focus-visible:outline-purple-400 sm:h-[190px]"
        aria-label={`Abrir ofertas de ${game.title}`}
      >
        <img
          src={game.image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1119] via-[#0e1119]/15 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className={`${anton.className} mb-2 text-lg text-white`}>{game.title}</h3>
          <div className="flex items-center gap-2">
            <span className="rounded border border-emerald-500/30 bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-400">
              {game.source === "free" ? "Grátis" : game.originalPrice === null ? "Brasil · R$" : `-${discount}%`}
            </span>
            <span className={`${anton.className} text-base text-white`}>
              {game.source === "free" ? "Grátis" : money(game.promotionalPrice, game.currency)}
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(game)}
      className="group flex w-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#293040] bg-[#191d25] text-left transition duration-200 hover:-translate-y-1 hover:border-purple-600 hover:shadow-[0_8px_30px_rgba(110,41,200,0.12)] focus-visible:outline-2 focus-visible:outline-purple-400"
      aria-label={`Ver detalhes e comparar preços de ${game.title}`}
    >
      <div className="relative h-36 w-full overflow-hidden bg-[#121720]">
        <img src={game.image} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#191d25] via-transparent to-transparent" />
        <span className="absolute bottom-2 left-2 rounded bg-[#151a22]/90 px-2 py-0.5 text-[11px] text-[#b2b8c5]">
          {game.genre}
        </span>
        <span className="absolute right-2 top-2 rounded border border-emerald-400/20 bg-emerald-400/15 px-2 py-1 text-xs font-bold text-emerald-400">
          {game.source === "free" ? "Grátis" : game.originalPrice === null ? "Brasil · R$" : `-${discount}%`}
        </span>
      </div>

      <div className="flex w-full flex-1 flex-col p-4">
        <h3 className={`${anton.className} truncate text-base text-white`} title={game.title}>
          {game.title}
        </h3>
        <div className="mt-2 flex items-center gap-1 text-[13px]">
          <span className="tracking-[2px] text-amber-400" aria-label="Avaliação Steam">PC</span>
          <span className="text-[11px] text-[#929cab]">{game.rating?.toFixed(1) ?? "Sem avaliação"}</span>
        </div>
        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[#98a2b5]">
          {game.description}
        </p>
        <div className="mt-3 border-t border-[#293040] pt-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              {game.originalPrice !== null && <p className="text-[11px] text-[#647084] line-through">{money(game.originalPrice, game.currency)}</p>}
              <p className={`${anton.className} mt-0.5 text-xl text-white`}>
                {game.source === "free" ? "Grátis" : money(game.promotionalPrice, game.currency)}
              </p>
            </div>
            <div className="text-right text-[11px] leading-5 text-[#9ca8bc]">
              <p>{(game.source !== "free" && game.originalPrice === null && game.currency === "BRL") ? "via GG.deals" : game.source === "free" ? "via GamerPower" : `na ${game.store}`}</p>
              <p>{(game.source !== "free" && game.originalPrice === null && game.currency === "BRL") ? "Lojas oficiais" : game.source === "free" ? "Confira as condições" : `${game.offers.length} lojas nesta consulta`}</p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}