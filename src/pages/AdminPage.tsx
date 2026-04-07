import { useState, useEffect } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

interface Player { id: number; name: string; country: string; position: string; }
interface MatchDay { id: number; name: string; deadline: string; }

export default function AdminPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matchDays, setMatchDays] = useState<MatchDay[]>([]);
  const [tab, setTab] = useState<"players" | "matchdays" | "scores">("players");

  // Player form
  const [pName, setPName] = useState("");
  const [pCountry, setPCountry] = useState("");
  const [pPosition, setPPosition] = useState("delantero");

  // Match day form
  const [mdName, setMdName] = useState("");
  const [mdDeadline, setMdDeadline] = useState("");

  // Score form
  const [selectedMd, setSelectedMd] = useState<number>(0);
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [yellowCards, setYellowCards] = useState(0);
  const [redCards, setRedCards] = useState(0);
  const [cleanSheet, setCleanSheet] = useState(false);
  const [ownGoals, setOwnGoals] = useState(0);
  const [minutesPlayed, setMinutesPlayed] = useState(0);

  const [msg, setMsg] = useState("");

  const load = () => {
    api.get("/players/").then((r) => setPlayers(r.data));
    api.get("/match-days/").then((r) => setMatchDays(r.data));
  };
  useEffect(load, []);

  const addPlayer = async () => {
    await api.post("/players/", { name: pName, country: pCountry, position: pPosition });
    setPName(""); setPCountry("");
    setMsg("Jugador agregado");
    load();
  };

  const addMatchDay = async () => {
    await api.post("/match-days/", { name: mdName, deadline: mdDeadline });
    setMdName(""); setMdDeadline("");
    setMsg("Fecha creada");
    load();
  };

  const addScore = async () => {
    await api.post(`/match-days/${selectedMd}/scores`, [{
      player_id: selectedPlayer, goals, assists, yellow_cards: yellowCards,
      red_cards: redCards, clean_sheet: cleanSheet, own_goals: ownGoals, minutes_played: minutesPlayed,
    }]);
    setMsg("Puntos cargados");
    setGoals(0); setAssists(0); setYellowCards(0); setRedCards(0);
    setCleanSheet(false); setOwnGoals(0); setMinutesPlayed(0);
  };

  return (
    <div className="page">
      <Link to="/">← Volver</Link>
      <h2>Panel de Administración</h2>
      {msg && <p className="success">{msg}</p>}

      <div className="admin-tabs">
        <button className={tab === "players" ? "active" : ""} onClick={() => setTab("players")}>Jugadores</button>
        <button className={tab === "matchdays" ? "active" : ""} onClick={() => setTab("matchdays")}>Fechas</button>
        <button className={tab === "scores" ? "active" : ""} onClick={() => setTab("scores")}>Cargar Puntos</button>
      </div>

      {tab === "players" && (
        <div className="admin-section">
          <h3>Agregar jugador</h3>
          <input placeholder="Nombre" value={pName} onChange={(e) => setPName(e.target.value)} />
          <input placeholder="País" value={pCountry} onChange={(e) => setPCountry(e.target.value)} />
          <select value={pPosition} onChange={(e) => setPPosition(e.target.value)}>
            <option value="arquero">Arquero</option>
            <option value="defensor">Defensor</option>
            <option value="mediocampista">Mediocampista</option>
            <option value="delantero">Delantero</option>
          </select>
          <button onClick={addPlayer}>Agregar</button>
          <h3>Jugadores ({players.length})</h3>
          <table>
            <thead><tr><th>Nombre</th><th>País</th><th>Posición</th></tr></thead>
            <tbody>{players.map((p) => <tr key={p.id}><td>{p.name}</td><td>{p.country}</td><td>{p.position}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {tab === "matchdays" && (
        <div className="admin-section">
          <h3>Crear fecha</h3>
          <input placeholder="Nombre (ej: Fecha 1)" value={mdName} onChange={(e) => setMdName(e.target.value)} />
          <input type="datetime-local" value={mdDeadline} onChange={(e) => setMdDeadline(e.target.value)} />
          <button onClick={addMatchDay}>Crear</button>
          <h3>Fechas ({matchDays.length})</h3>
          <ul>{matchDays.map((md) => <li key={md.id}>{md.name} — {new Date(md.deadline).toLocaleString()}</li>)}</ul>
        </div>
      )}

      {tab === "scores" && (
        <div className="admin-section">
          <h3>Cargar puntos</h3>
          <select value={selectedMd} onChange={(e) => setSelectedMd(Number(e.target.value))}>
            <option value={0}>Seleccionar fecha</option>
            {matchDays.map((md) => <option key={md.id} value={md.id}>{md.name}</option>)}
          </select>
          <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(Number(e.target.value))}>
            <option value={0}>Seleccionar jugador</option>
            {players.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.country})</option>)}
          </select>
          <label>Goles <input type="number" value={goals} onChange={(e) => setGoals(Number(e.target.value))} /></label>
          <label>Asistencias <input type="number" value={assists} onChange={(e) => setAssists(Number(e.target.value))} /></label>
          <label>Amarillas <input type="number" value={yellowCards} onChange={(e) => setYellowCards(Number(e.target.value))} /></label>
          <label>Rojas <input type="number" value={redCards} onChange={(e) => setRedCards(Number(e.target.value))} /></label>
          <label>Valla invicta <input type="checkbox" checked={cleanSheet} onChange={(e) => setCleanSheet(e.target.checked)} /></label>
          <label>Goles en contra <input type="number" value={ownGoals} onChange={(e) => setOwnGoals(Number(e.target.value))} /></label>
          <label>Minutos jugados <input type="number" value={minutesPlayed} onChange={(e) => setMinutesPlayed(Number(e.target.value))} /></label>
          <button onClick={addScore} disabled={!selectedMd || !selectedPlayer}>Cargar</button>
        </div>
      )}
    </div>
  );
}
