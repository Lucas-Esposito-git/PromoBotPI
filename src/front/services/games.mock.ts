
export interface Game {
  id: number;
  title: string;
  store: string;
  genre: string;
  image: string;
  originalPrice: number;
  promotionalPrice: number;
}

export const mockGames: Game[] = [
  {
    id: 1,
    title: "Cyberpunk 2077",
    genre: "Aventura",
    store: "Steam",
    image: "/games/cyberpunk.jpg",
    originalPrice: 199.90,
    promotionalPrice: 99.95,
  },
  {
    id: 2,
    title: "The Witcher 3",
    genre: "RPG",
    store: "Steam",
    image: "/games/witcher3.jpg",
    originalPrice: 129.99,
    promotionalPrice: 25.99,
  },
  {
    id: 3,
    title: "Red Dead Redemption 2",
    store: "Epic Games",
    genre: "Aventura",
    image: "/games/reddead2.jpg",
    originalPrice: 299.90,
    promotionalPrice: 149.95,
  },
  {
    id: 4,
    title: "Hogwarts Legacy",
    store: "Steam",
    genre: "Aventura",
    image: "/games/hogwarts.jpg",
    originalPrice: 249.99,
    promotionalPrice: 124.99,
  },
];
