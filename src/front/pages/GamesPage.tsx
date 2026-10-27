
import GameList from "../components/GameList";
import "../styles/games.css";

export default function GamesPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0d1117",
        color: "#f1f5f9",
      }}
    >
      <header
        style={{
          padding: "24px",
          borderBottom: "1px solid #293342",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
          }}
        >
          Promo
          <span style={{ color: "#a855f7" }}>
            Bot
          </span>
        </h1>

        <p style={{ color: "#94a3b8" }}>
          Encontre as melhores promoções de jogos.
        </p>
      </header>

      <GameList />
    </main>
  );
}
