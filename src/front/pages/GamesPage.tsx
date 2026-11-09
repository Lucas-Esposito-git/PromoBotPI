"use client";

import { useState } from "react";
import GameList from "../components/GameList";
import { mockGames, discountPercent } from "../services/games.mock";
import { anton } from "../fonts";
import Image from "next/image";

const storeCount = new Set(
  mockGames.flatMap((game) => game.offers.map((offer) => offer.store)),
).size;
const averageDiscount = Math.floor(
  mockGames.reduce(
    (sum, game) =>
      sum + discountPercent(game.originalPrice, game.promotionalPrice),
    0,
  ) / mockGames.length,
);

export default function GamesPage() {
  const [search, setSearch] = useState("");

  return (
    <main className="min-h-screen bg-[#0e1117] font-sans text-white">
      <header className="sticky top-0 z-30 border-b border-[#2a2e3a] bg-[#101217]/95 backdrop-blur-md">
        <div className="mx-auto grid max-w-[1280px] gap-4 px-4 py-3 sm:px-6 md:grid-cols-[1fr_minmax(280px,575px)_1fr] md:items-center">
          <a href="#inicio" className="flex w-fit items-center gap-2">
            <Image
              src="/promobot.png"
              alt="Robô PromoBot"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <strong className={`${anton.className} text-lg`}>
              Promo<span className="text-[#a855f7]">Bot</span>
            </strong>
          </a>
          <div className="flex items-center gap-3 rounded-xl border border-[#2a3042] bg-[#1b202b] px-3 py-2.5">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0 text-[#687386]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <circle cx="10.8" cy="10.8" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              type="search"
              aria-label="Pesquisar jogos"
              placeholder="Pesquisar jogos, gêneros, plataformas..."
              className="min-w-0 flex-1 bg-transparent text-sm text-[#e6e7eb] outline-none placeholder:text-[#818895]"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="hidden md:block" />
        </div>
      </header>

      <section
        id="inicio"
        className="relative overflow-hidden border-b border-[#262234] bg-[radial-gradient(ellipse_at_80%_25%,#2b154d_0%,transparent_42%),linear-gradient(105deg,#0c1119_0%,#160c29_55%,#121021_100%)]"
      >
        <div className="pointer-events-none absolute -right-12 -top-28 h-[380px] w-[380px] rounded-full bg-purple-600/[0.06]" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-cyan-400/[0.05]" />
        <div className="relative mx-auto max-w-[1280px] px-4 pt-20 sm:px-6 sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-[11px] font-bold text-[#bd6aff]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            COMPRE JOGOS PELO MELHOR PREÇO
          </span>

          <h1
            className={`${anton.className} mt-6 text-[64px] leading-none tracking-tight sm:text-[76px]`}
          >
            Promo<span className="text-[#a64aeb]">Bot</span>
          </h1>
          <h2
            className={`${anton.className} mt-4 text-[20px] text-[#aab0c3] sm:text-[23px]`}
          >
            Promoções de jogos digitais em um só lugar.
          </h2>
          <p className="mt-4 max-w-[660px] text-sm leading-7 text-[#778198] sm:text-base">
            Uma plataforma para pesquisar, comparar e acompanhar ofertas de
            diferentes lojas digitais. Encontre o melhor preço sem precisar
            abrir 10 abas.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3 text-xs font-bold tracking-wider text-[#7d889e] sm:text-sm">
            <span>PESQUISAR</span>
            <span className="text-purple-400">→</span>
            <span>COMPARAR</span>
            <span className="text-pink-500">→</span>
            <span>DECIDIR</span>
          </div>

          <div className="mt-20 flex flex-wrap items-center gap-8 border-t border-[#323044]/70 py-7 sm:gap-12">
            <p className="flex items-center gap-3">
              <span className={`${anton.className} text-[28px] text-[#a855f7]`}>
                {mockGames.length}
              </span>
              <span className="text-sm text-[#778198]">Jogos catalogados</span>
            </p>
            <p className="flex items-center gap-3">
              <span className={`${anton.className} text-[28px] text-[#31d0a0]`}>
                {storeCount}
              </span>
              <span className="text-sm text-[#778198]">Lojas integradas*</span>
            </p>
            <p className="flex items-center gap-3">
              <span className={`${anton.className} text-[28px] text-[#ec2388]`}>
                {averageDiscount}%
              </span>
              <span className="text-sm text-[#778198]">Desconto médio*</span>
            </p>
          </div>
        </div>
      </section>

      <GameList search={search} />

      <footer className="mt-16 border-t border-[#262c3a] bg-[#191d24]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-4 py-9 text-center sm:px-6 md:flex-row md:items-center md:justify-between md:text-left">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold">
              P
            </span>
            <strong className={`${anton.className} text-base`}>
              Promo<span className="text-[#a855f7]">Bot</span>
            </strong>
          </div>
          <div className="text-xs leading-5 text-[#606a80]">
            <p>Lucas Gabriel · Filipe Estevão · Lucas André · Marco Túlio</p>
            <p>FACULDADE SENAI FATESG · ADS · Goiânia, 2026</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
