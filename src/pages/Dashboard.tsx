import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../services/api";

interface Team {
  players: { id: number }[];
}

interface League {
  id: number;
  name: string;
}

interface MatchDay {
  id: number;
  name: string;
  deadline: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matchDays, setMatchDays] = useState<MatchDay[]>([]);

  useEffect(() => {
    api.get("/teams/").then((r) => setTeam(r.data)).catch(() => setTeam(null));
    api.get("/leagues/").then((r) => setLeagues(r.data)).catch(() => {});
    api.get("/match-days/").then((r) => setMatchDays(r.data)).catch(() => {});
  }, []);

  const nextMatchDay = matchDays
    .filter((md) => new Date(md.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];

  const getCountdown = (deadline: string): string => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return "Cerrada";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="dashboard">
      <header>
        <h1>GranDT <span className="accent">Mundial</span> ⚽</h1>
        <div className="header-right">
          <span>Hola, {user?.username}</span>
          <button onClick={logout}>Salir</button>
        </div>
      </header>
      <nav>
        <Link to="/team">Mi Equipo</Link>
        <Link to="/leagues">Mis Ligas</Link>
        {user?.is_admin && <Link to="/admin">Admin</Link>}
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <Link to="/team" className="dash-card">
            <div className="dash-card-icon">⚽</div>
            <h3>Mi Equipo</h3>
            {team && team.players.length > 0 ? (
              <>
                <div className="dash-card-value">{team.players.length}/11</div>
                <p>
                  {team.players.length === 11
                    ? "Equipo completo"
                    : "Equipo incompleto"}
                </p>
              </>
            ) : (
              <p>Todavia no armaste tu equipo. Elegí tus 11 jugadores.</p>
            )}
            <div className="dash-card-arrow">Ver equipo →</div>
          </Link>

          <Link to="/leagues" className="dash-card">
            <div className="dash-card-icon">🏆</div>
            <h3>Mis Ligas</h3>
            <div className="dash-card-value">{leagues.length}</div>
            <p>
              {leagues.length === 0
                ? "Unite o creá una liga para competir"
                : leagues.length === 1
                ? "liga activa"
                : "ligas activas"}
            </p>
            <div className="dash-card-arrow">Ver ligas →</div>
          </Link>

          <div className="dash-card" style={{ cursor: "default" }}>
            <div className="dash-card-icon">📅</div>
            <h3>Próxima Fecha</h3>
            {nextMatchDay ? (
              <>
                <div className="dash-card-value">{getCountdown(nextMatchDay.deadline)}</div>
                <p>{nextMatchDay.name}</p>
                <p style={{ fontSize: "0.8rem", color: "#5a6a7a" }}>
                  Cierre: {new Date(nextMatchDay.deadline).toLocaleString("es-AR")}
                </p>
              </>
            ) : (
              <p>No hay fechas próximas programadas</p>
            )}
          </div>

          {user?.is_admin && (
            <Link to="/admin" className="dash-card">
              <div className="dash-card-icon">⚙️</div>
              <h3>Administración</h3>
              <p>Gestionar jugadores, fechas y puntajes</p>
              <div className="dash-card-arrow">Ir al panel →</div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
