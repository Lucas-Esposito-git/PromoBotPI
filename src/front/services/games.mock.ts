export interface GameOffer {
  store: string;
  price: number;
  originalPrice: number;
  url: string;
}

export interface Game {
  id: number;
  title: string;
  store: string;
  genre: string;
  image: string;
  originalPrice: number;
  promotionalPrice: number;
  description: string;
  rating: number;
  tags: string[];
  offers: GameOffer[];
  featuredRank?: number;
}

const steamImage = (appId: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;

const searchUrl = (store: string, game: string, steamId?: number) => {
  const q = encodeURIComponent(game);
  if (store === "Steam" && steamId) return `https://store.steampowered.com/app/${steamId}/`;
  if (store === "GOG") return `https://www.gog.com/en/games?query=${q}`;
  if (store === "Epic Games") return `https://store.epicgames.com/pt-BR/browse?q=${q}`;
  if (store === "Rockstar") return "https://store.rockstargames.com/";
  return `https://www.nuuvem.com/br-pt/catalog/page/1?search=${q}`;
};

const makeOffers = (
  title: string,
  originalPrice: number,
  appId: number,
  entries: Array<[string, number]>
): GameOffer[] =>
  entries.map(([store, price]) => ({
    store,
    price,
    originalPrice,
    url: searchUrl(store, title, appId),
  }));

export const mockGames: Game[] = [
  {
    id: 1, title: "Cyberpunk 2077", genre: "RPG", store: "Steam",
    image: "/games/cyberpunk.jpg", originalPrice: 99.9, promotionalPrice: 29.9,
    rating: 4.2, featuredRank: 1,
    description: "Um RPG de ação e aventura em mundo aberto ambientado em Night City, uma megalópole obcecada com poder, glamour e modificações corporais.",
    tags: ["RPG", "Mundo Aberto", "Cyberpunk", "Ação"],
    offers: makeOffers("Cyberpunk 2077", 99.9, 1091500, [["Steam", 29.9], ["GOG", 34.9], ["Epic Games", 39.9]]),
  },
  {
    id: 2, title: "The Witcher 3", genre: "RPG", store: "GOG",
    image: "/games/witcher3.jpg", originalPrice: 99.9, promotionalPrice: 12.9,
    rating: 4.9, featuredRank: 3,
    description: "Assuma o papel de Geralt de Rívia, um caçador de monstros profissional, em um mundo aberto não linear cheio de aventuras.",
    tags: ["RPG", "Mundo Aberto", "Fantasia", "Aventura"],
    offers: makeOffers("The Witcher 3", 99.9, 292030, [["GOG", 12.9], ["Steam", 17.9], ["Nuvem", 24.9]]),
  },
  {
    id: 3, title: "Red Dead Redemption 2", genre: "Aventura", store: "Nuvem",
    image: "/games/reddead2.jpg", originalPrice: 179.9, promotionalPrice: 39.9,
    rating: 4.8, featuredRank: 2,
    description: "América, 1899. No fim da era dos foras-da-lei, Arthur Morgan e a gangue Van der Linde devem roubar, saquear e brigar para sobreviver.",
    tags: ["Aventura", "Mundo Aberto", "Western", "História"],
    offers: makeOffers("Red Dead Redemption 2", 179.9, 1174180, [["Nuvem", 39.9], ["Steam", 44.9], ["Rockstar", 49.9]]),
  },
  {
    id: 4, title: "GTA V", genre: "Ação", store: "Steam",
    image: steamImage(271590), originalPrice: 99.9, promotionalPrice: 19.9,
    rating: 4.3,
    description: "Quando um jovem golpista, um ladrão aposentado e um psicopata aterrorizante se envolvem com o crime, tudo pode acontecer.",
    tags: ["Ação", "Mundo Aberto", "Crime"],
    offers: makeOffers("Grand Theft Auto V", 99.9, 271590, [["Steam", 19.9], ["Epic Games", 24.9], ["Nuvem", 29.9]]),
  },
  {
    id: 5, title: "Hollow Knight", genre: "Plataforma", store: "Steam",
    image: steamImage(367520), originalPrice: 39.9, promotionalPrice: 9.9,
    rating: 4.8,
    description: "Aventure-se pelos reinos subterrâneos de um vasto reino de insetos arruinado. Descubra segredos e enfrente criaturas.",
    tags: ["Plataforma", "Metroidvania", "Indie"],
    offers: makeOffers("Hollow Knight", 39.9, 367520, [["Steam", 9.9], ["GOG", 13.9], ["Nuvem", 18.9]]),
  },
  {
    id: 6, title: "Death Stranding", genre: "Ação", store: "Epic Games",
    image: steamImage(1190460), originalPrice: 114.9, promotionalPrice: 29.9,
    rating: 4.1,
    description: "Sam Bridges deve percorrer uma América destruída por eventos catastróficos. Reconecte a sociedade em uma jornada única.",
    tags: ["Ação", "Aventura", "Mundo Aberto"],
    offers: makeOffers("Death Stranding", 114.9, 1190460, [["Epic Games", 29.9], ["Steam", 39.9]]),
  },
  {
    id: 7, title: "God of War", genre: "Ação", store: "Nuvem",
    image: steamImage(1593500), originalPrice: 124.9, promotionalPrice: 44.9,
    rating: 4.7,
    description: "Kratos e seu filho Atreus embarcam em uma épica jornada pelos Nove Reinos da mitologia nórdica, repleta de desafios.",
    tags: ["Ação", "Aventura", "Mitologia"],
    offers: makeOffers("God of War", 124.9, 1593500, [["Nuvem", 44.9], ["Steam", 54.9]]),
  },
  {
    id: 8, title: "Marvel's Spider-Man Remastered", genre: "Ação", store: "Nuvem",
    image: steamImage(1817070), originalPrice: 249.9, promotionalPrice: 89.9,
    rating: 4.6,
    description: "Experimente a história de Peter Parker em um NYC deslumbrante. Aproveite combates rápidos e uma cidade cheia de vida.",
    tags: ["Ação", "Aventura", "Super-herói"],
    offers: makeOffers("Marvel's Spider-Man Remastered", 249.9, 1817070, [["Nuvem", 89.9], ["Steam", 99.9]]),
  },
  {
    id: 9, title: "Hades", genre: "Roguelike", store: "Epic Games",
    image: steamImage(1145360), originalPrice: 62.9, promotionalPrice: 22.9,
    rating: 4.8,
    description: "Desafie o deus dos mortos enquanto você tenta escapar da Casa do Hades neste roguelike de ação em ritmo acelerado.",
    tags: ["Roguelike", "Ação", "Mitologia"],
    offers: makeOffers("Hades", 62.9, 1145360, [["Epic Games", 22.9], ["Steam", 29.9], ["Nuvem", 34.9]]),
  },
  {
    id: 10, title: "Elden Ring", genre: "Ação", store: "Nuvem",
    image: steamImage(1245620), originalPrice: 249.9, promotionalPrice: 114.9,
    rating: 4.9,
    description: "Uma épica aventura de fantasia criada em colaboração com George R. R. Martin e Hidetaka Miyazaki.",
    tags: ["Ação", "RPG", "Mundo Aberto"],
    offers: makeOffers("Elden Ring", 249.9, 1245620, [["Nuvem", 114.9], ["Steam", 129.9]]),
  },
  {
    id: 11, title: "Stardew Valley", genre: "Simulação", store: "GOG",
    image: steamImage(413150), originalPrice: 29.9, promotionalPrice: 13.9,
    rating: 4.9,
    description: "Você herdou a antiga fazenda do seu avô em Stardew Valley. Armado com ferramentas usadas e vontade de começar uma nova vida.",
    tags: ["Simulação", "Indie", "Fazenda"],
    offers: makeOffers("Stardew Valley", 29.9, 413150, [["GOG", 13.9], ["Steam", 17.9]]),
  },
  {
    id: 12, title: "Baldur's Gate 3", genre: "RPG", store: "GOG",
    image: steamImage(1086940), originalPrice: 199.9, promotionalPrice: 144.9,
    rating: 4.9,
    description: "Reunidos por um destino terrível, explore um mundo de Faerûn em um RPG de aventura que define o gênero.",
    tags: ["RPG", "Fantasia", "Aventura"],
    offers: makeOffers("Baldur's Gate 3", 199.9, 1086940, [["GOG", 144.9], ["Steam", 149.9]]),
  },
];

export const discountPercent = (original: number, promotional: number) =>
  original > 0 ? Math.round(((original - promotional) / original) * 100) : 0;

export const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);