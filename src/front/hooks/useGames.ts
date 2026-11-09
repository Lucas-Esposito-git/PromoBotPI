"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { gameKey, preferGame, type CatalogCursor, type CatalogPage, type CatalogSource, type Game } from "../services/games";
export function useGames(search = "", source: CatalogSource = "all") {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [omitted, setOmitted] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);
  const nextPage = useRef(0);
  const cursorRef = useRef<CatalogCursor | undefined>(undefined);
  const [warnings, setWarnings] = useState<string[]>([]);
  const busy = useRef(false);
  const requestPage = useCallback(async (page: number, controller: AbortController) => {
    setError(null);
    try {
      const query = new URLSearchParams({ title: search.trim(), source, page: String(page) });
      if (source === "all" && cursorRef.current) query.set("cursor", JSON.stringify(cursorRef.current));
      const response = await fetch(`/api/catalogo?${query}`, { signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Não foi possível carregar as ofertas.");
      if (!Array.isArray(data.games) || typeof data.hasMore !== "boolean") throw new Error("Resposta inesperada do catálogo.");
      if (controller.signal.aborted) return;
      const catalog = data as CatalogPage;
      setGames(previous => {
        const byId = new Map((page === 0 ? [] : previous).map(game => [gameKey(game), game]));
        for (const game of catalog.games) {
          const key = gameKey(game);
          const existing = byId.get(key);
          if (source === "all") { byId.set(key, preferGame(existing, game)); continue; }
          if (!existing || source !== "usd") { byId.set(key, game); continue; }
          const offers = new Map(existing.offers.map(offer => [offer.store, offer]));
          for (const offer of game.offers) if (!offers.has(offer.store) || offer.price < offers.get(offer.store)!.price) offers.set(offer.store, offer);
          const sorted = [...offers.values()].sort((a,b) => a.price-b.price);
          byId.set(key, { ...existing, offers: sorted, store: sorted[0].store, originalPrice: sorted[0].originalPrice, promotionalPrice: sorted[0].price });
        }
        return [...byId.values()];
      });
      setOmitted(value => page === 0 ? catalog.omitted : value + catalog.omitted);
      setWarnings(catalog.warnings ?? []);
      cursorRef.current = catalog.nextCursor;
      setHasMore(catalog.hasMore);
      nextPage.current = page + 1;
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Erro ao carregar ofertas.");
    } finally {
      if (!controller.signal.aborted) { busy.current = false; setLoading(false); setLoadingMore(false); }
    }
  }, [search, source]);
  useEffect(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    busy.current = true; nextPage.current = 0; cursorRef.current = undefined; setWarnings([]);
    setGames([]); setHasMore(false); setOmitted(0); setError(null); setLoading(true); setLoadingMore(false);
    const timer = setTimeout(() => { void requestPage(0, controller); }, 800);
    return () => { clearTimeout(timer); controller.abort(); controllerRef.current?.abort(); };
  }, [requestPage, attempt]);
  const loadMore = () => {
    if (busy.current || !hasMore) return;
    busy.current = true; setLoadingMore(true);
    const controller = new AbortController(); controllerRef.current = controller;
    void requestPage(nextPage.current, controller);
  };
  const retry = () => {
    if (nextPage.current === 0) setAttempt(value => value + 1);
    else loadMore();
  };
  return { games, loading, loadingMore, error, hasMore, omitted, warnings, loadMore, retry };
}
