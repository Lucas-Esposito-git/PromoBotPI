
"use client";

import { useEffect, useState } from "react";
import { mockGames, type Game } from "../services/games.mock";

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGames(mockGames);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return {
    games,
    loading,
    isEmpty: !loading && games.length === 0,
  };
}
