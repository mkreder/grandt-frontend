import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [league, setLeague] = useState<League | null>(null);

  useEffect(() => {
    api.get(`/leagues/${leagueId}`).then((r) => setLeague(r.data));
    api.get(`/standings/${leagueId}`).then((r) => setStandings(r.data));
  }, [leagueId]);

  const matchDays = standings.length > 0 ? Object.keys(standings[0].points_by_match_day) : [];

  return (
    <div className="page">
      <Link to="/leagues">← Volver a ligas</Link>
      <h2>{league?.name}</h2>
      <p>Código: <strong>{league?.code}</strong></p>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Usuario</th>
            {matchDays.map((md) => <th key={md}>{md}</th>)}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.user_id}>
              <td>{i + 1}</td>
              <td>{s.username}</td>
              {matchDays.map((md) => <td key={md}>{s.points_by_match_day[md]}</td>)}
              <td><strong>{s.total_points}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
      {standings.length === 0 && <p>No hay datos de puntos todavía.</p>}
    </div>
  );
}
