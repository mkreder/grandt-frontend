import { useState, useEffect } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

interface Player {
  id: number;
  name: string;
  country: string;
  position: string;
}

const POSITIONS = ["arquero", "defensor", "mediocampista", "delantero"];
const REQUIRED: Record<string, number> = { arquero: 1, defensor: 4, mediocampista: 3, delantero: 3 };

export default function TeamPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [filter, setFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/players/").then((r) => setPlayers(r.data));
    api.get("/teams/").then((r) => setSelected(r.data.players.map((p: Player) => p.id))).catch(() => {});
  }, []);

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setSaved(false);
  };

  const selectedPlayers = players.filter((p) => selected.includes(p.id));
  const posCount: Record<string, number> = {};
  selectedPlayers.forEach((p) => (posCount[p.position] = (posCount[p.position] || 0) + 1));

  const save = async () => {
    setError("");
    try {
      await api.put("/teams/", { player_ids: selected });
      setSaved(true);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Error al guardar");
    }
  };

  const countries = [...new Set(players.map((p) => p.country))].sort();
  const filtered = players.filter(
    (p) => (!filter || p.position === filter) && (!countryFilter || p.country === countryFilter)
  );

  return (
    <div className="page">
      <Link to="/">← Volver</Link>
      <h2>Mi Equipo</h2>

      <div className="formation-summary">
        {POSITIONS.map((pos) => (
          <span key={pos} className={posCount[pos] === REQUIRED[pos] ? "ok" : ""}>
            {pos}: {posCount[pos] || 0}/{REQUIRED[pos]}
          </span>
        ))}
        <strong>Total: {selected.length}/11</strong>
      </div>

      {error && <p className="error">{error}</p>}
      {saved && <p className="success">¡Equipo guardado!</p>}

      <div className="team-layout">
        <div className="player-list">
          <h3>Jugadores disponibles</h3>
          <div className="filters">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">Todas las posiciones</option>
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              <option value="">Todos los países</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <ul>
            {filtered.map((p) => (
              <li key={p.id} className={selected.includes(p.id) ? "selected" : ""} onClick={() => toggle(p.id)}>
                <span className="player-name">{p.name}</span>
                <span className="player-info">{p.country} · {p.position}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="selected-list">
          <h3>Tu equipo</h3>
          {POSITIONS.map((pos) => (
            <div key={pos}>
              <h4>{pos}</h4>
              <ul>
                {selectedPlayers.filter((p) => p.position === pos).map((p) => (
                  <li key={p.id} onClick={() => toggle(p.id)}>
                    {p.name} ({p.country}) ✕
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <button onClick={save} disabled={selected.length !== 11}>Confirmar equipo</button>
        </div>
      </div>
    </div>
  );
}
