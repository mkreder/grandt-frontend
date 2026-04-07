import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface StandingEntry {
  user_id: number;
  username: string;
  total_points: number;
  points_by_match_day: Record<string, number>;
}

interface League {
  id: number;
  name: string;
  code: string;
  members: { id: number; username: string }[];
}

export default function StandingsPage() {
  const { leagueId } = useParams();
  const { user } = useAuth();
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [league, setLeague] = useState<League | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/leagues/${leagueId}`).then((r) => setLeague(r.data));
    api.get(`/standings/${leagueId}`).then((r) => setStandings(r.data));
  }, [leagueId]);

  const matchDays = standings.length > 0 ? Object.keys(standings[0].points_by_match_day) : [];

  const getRankDisplay = (index: number): string => {
    if (index === 0) return "\u{1F947}";
    if (index === 1) return "\u{1F948}";
    if (index === 2) return "\u{1F949}";
    return `#${index + 1}`;
  };

  const copyCode = () => {
    if (league?.code) {
      navigator.clipboard.writeText(league.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="page">
      <Link to="/leagues" className="back-link">← Volver a ligas</Link>

      {league && (
        <div className="standings-header">
          <div>
            <h2 style={{ marginBottom: "0.25rem" }}>{league.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="league-code">
                {league.code}
                <button className="copy-btn" onClick={copyCode} title="Copiar código">
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </span>
            </div>
          </div>
          <div className="standings-meta">
            <span>👥 {league.members.length} miembros</span>
            <span>📊 {matchDays.length} fechas</span>
          </div>
        </div>
      )}

      {standings.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Pos</th>
                <th>Usuario</th>
                {matchDays.map((md) => (
                  <th key={md} style={{ textAlign: "center" }}>{md}</th>
                ))}
                <th style={{ textAlign: "center" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <tr key={s.user_id} className={s.user_id === user?.id ? "highlight-row" : ""}>
                  <td className="rank-cell">
                    {i < 3 ? (
                      <span className="rank-medal">{getRankDisplay(i)}</span>
                    ) : (
                      getRankDisplay(i)
                    )}
                  </td>
                  <td style={{ fontWeight: s.user_id === user?.id ? 700 : 400, color: s.user_id === user?.id ? "#00c853" : undefined }}>
                    {s.username}
                    {s.user_id === user?.id && " (vos)"}
                  </td>
                  {matchDays.map((md) => (
                    <td key={md} style={{ textAlign: "center" }}>{s.points_by_match_day[md]}</td>
                  ))}
                  <td className="total-col" style={{ textAlign: "center" }}>{s.total_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>No hay datos de puntos todavia.</p>
          <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Los puntajes aparecerán cuando se carguen resultados.</p>
        </div>
      )}
    </div>
  );
}
