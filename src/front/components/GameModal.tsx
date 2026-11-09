"use client";

import { useEffect } from "react";
import type { Game } from "../services/games";
import { money, discountPercent } from "../services/games";
import { anton } from "../fonts";

type Props = { game: Game | null; onClose: () => void };

const storeIcon: Record<string, string> = {
  Steam: "🎮",
  GOG: "☀️",
  "Epic Games": "⚡",
  Nuvem: "BR",
  Rockstar: "★",
};

export default function GameModal({ game, onClose }: Props) {
  useEffect(() => {
    if (!game) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [game, onClose]);

  if (!game) return null;

  const offers = [...game.offers].sort((a, b) => a.price - b.price);
  const discount = discountPercent(game.originalPrice, game.promotionalPrice);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#06080d]/80 p-3 backdrop-blur-[7px] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-modal-title"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-[670px] overflow-y-auto rounded-2xl border border-[#293247] bg-[#191d25] shadow-2xl"
      >
        <div className="relative h-[235px] overflow-hidden sm:h-[245px]">
          <img src={game.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#191d25] via-[#191d25]/15 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/50 text-xl text-white/80 hover:bg-black/80"
            aria-label="Fechar detalhes"
          >
            ×
          </button>
          <div className="absolute bottom-5 left-5 right-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded bg-purple-500/25 px-2 py-1 text-xs text-purple-300">{game.genre}</span>
              <span className="rounded border border-emerald-500/30 bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-400">
                {game.source === "free" ? "Grátis" : game.originalPrice === null ? "Brasil · R$" : `-${discount}%`}
              </span>
            </div>
            <h2 id="game-modal-title" className={`${anton.className} text-2xl text-white sm:text-[27px]`}>
              {game.title}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="tracking-[2px] text-amber-400">PC</span>
              <span className="text-[#9ca5b4]">{game.rating?.toFixed(1) ?? "Sem avaliação"}</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap gap-2">
            {game.tags.map((tag) => (
              <span key={tag} className="rounded border border-[#293143] bg-[#222837] px-2.5 py-1.5 text-xs text-[#a5adbc]">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[13px] leading-6 text-[#9ca5b2]">{game.description}</p>
          <h3 className="mt-6 mb-3 text-sm font-bold tracking-[2px] text-[#626c7e]">
            {(game.source !== "free" && game.originalPrice === null && game.currency === "BRL") ? "PREÇO BRASIL · GG.DEALS" : game.source === "free" ? "RESGATAR JOGO GRÁTIS" : "COMPARAR PREÇOS"}
          </h3>
          <div className="space-y-2">
            {offers.map((offer, index) => (
              <div
                key={offer.store}
                className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 sm:flex-nowrap ${index === 0
                    ? "border-emerald-500/35 bg-emerald-500/[0.07]"
                    : "border-[#293143] bg-[#222736]"
                  }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center text-xs font-bold text-purple-400">
                  {storeIcon[offer.store] ?? "🎮"}
                </span>
                <div className="min-w-[110px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm text-[#d8dce4]">{offer.store}</strong>
                    {index === 0 && (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                        {(game.source !== "free" && game.originalPrice === null && game.currency === "BRL") ? "Menor monitorado" : game.source === "free" ? "Grátis" : "Menor nesta consulta"}
                      </span>
                    )}
                  </div>
                  {offer.originalPrice !== null && <p className="text-[11px] text-[#667185] line-through">{money(offer.originalPrice, game.currency)}</p>}
                </div>
                <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-bold text-emerald-400">
                  {game.source === "free" ? "Grátis" : offer.originalPrice === null ? "BRL" : `-${discountPercent(offer.originalPrice, offer.price)}%`}
                </span>
                <strong className={`${anton.className} min-w-[70px] text-right text-base ${index === 0 ? "text-emerald-400" : "text-white"}`}>
                  {game.source === "free" ? "Grátis" : money(offer.price, game.currency)}
                </strong>
                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-[#8538ed] px-3 py-2 text-center text-xs font-bold text-white transition hover:bg-[#9b4cff]"
                >
                  {(game.source !== "free" && game.originalPrice === null && game.currency === "BRL") ? "Ver lojas" : game.source === "free" ? "Resgatar" : "Comprar"}
                </a>
              </div>
            ))}
          </div>
          {(game.source !== "free" && game.originalPrice === null && game.currency === "BRL") && game.historicalLow != null && <p className="mt-4 text-sm text-slate-300">Menor preço histórico em lojas oficiais: {money(game.historicalLow, "BRL")}</p>}
          <a className="mt-4 inline-block text-sm text-purple-400 underline" href={game.source === "steam" ? "https://store.steampowered.com/" : game.source === "free" ? "https://www.gamerpower.com/" : game.currency === "BRL" ? "https://gg.deals/" : "https://www.cheapshark.com/"} target="_blank" rel="noopener noreferrer">Fonte: {game.source === "steam" ? "Steam" : game.source === "free" ? "GamerPower" : game.currency === "BRL" ? "GG.deals" : "CheapShark"}</a>
          <p className="mt-4 text-[11px] text-[#6f798a]">
            {game.source === "steam" ? "Preço da loja Steam brasileira. Confira o preço atual na loja antes de comprar." : game.source === "free" ? "Confira o prazo, as instruções e as condições regionais para resgatar na página da oferta. O valor de referência em dólares da GamerPower não é tratado como preço brasileiro." : game.currency === "BRL" ? "Preço regional em BRL da GG.deals, com cache de até 1 hora. O endpoint não identifica a loja nem o desconto. Confira no comparador." : "Preços em USD via CheapShark. Comparação limitada às ofertas carregadas."}
          </p>
        </div>
      </section>
    </div>
  );
}