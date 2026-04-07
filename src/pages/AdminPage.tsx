import { useState, useEffect } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

interface Player { id: number; name: string; country: string; position: string; }
interface MatchDay { id: number; name: string; deadline: string; }

const POSITION_LABELS: Record<string, string> = {
  arquero: "Arquero",
  defensor: "Defensor",
  mediocampista: "Mediocampista",
  delantero: "Delantero",
};

const COUNTRY_FLAGS: Record<string, string> = {
  "Argentina": "\u{1F1E6}\u{1F1F7}",
  "Brasil": "\u{1F1E7}\u{1F1F7}",
  "Francia": "\u{1F1EB}\u{1F1F7}",
  "Alemania": "\u{1F1E9}\u{1F1EA}",
  "España": "\u{1F1EA}\u{1F1F8}",
  "Inglaterra": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  "Portugal": "\u{1F1F5}\u{1F1F9}",
  "Países Bajos": "\u{1F1F3}\u{1F1F1}",
  "Holanda": "\u{1F1F3}\u{1F1F1}",
  "Bélgica": "\u{1F1E7}\u{1F1EA}",
  "Croacia": "\u{1F1ED}\u{1F1F7}",
  "Uruguay": "\u{1F1FA}\u{1F1FE}",
  "Colombia": "\u{1F1E8}\u{1F1F4}",
  "México": "\u{1F1F2}\u{1F1FD}",
  "Estados Unidos": "\u{1F1FA}\u{1F1F8}",
  "USA": "\u{1F1FA}\u{1F1F8}",
  "Japón": "\u{1F1EF}\u{1F1F5}",
  "Corea del Sur": "\u{1F1F0}\u{1F1F7}",
  "Australia": "\u{1F1E6}\u{1F1FA}",
  "Arabia Saudita": "\u{1F1F8}\u{1F1E6}",
  "Qatar": "\u{1F1F6}\u{1F1E6}",
  "Irán": "\u{1F1EE}\u{1F1F7}",
  "Ghana": "\u{1F1EC}\u{1F1ED}",
  "Senegal": "\u{1F1F8}\u{1F1F3}",
  "Camerún": "\u{1F1E8}\u{1F1F2}",
  "Marruecos": "\u{1F1F2}\u{1F1E6}",
  "Túnez": "\u{1F1F9}\u{1F1F3}",
  "Nigeria": "\u{1F1F3}\u{1F1EC}",
  "Ecuador": "\u{1F1EA}\u{1F1E8}",
  "Costa Rica": "\u{1F1E8}\u{1F1F7}",
  "Canadá": "\u{1F1E8}\u{1F1E6}",
  "Gales": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}",
  "Serbia": "\u{1F1F7}\u{1F1F8}",
  "Suiza": "\u{1F1E8}\u{1F1ED}",
  "Dinamarca": "\u{1F1E9}\u{1F1F0}",
  "Polonia": "\u{1F1F5}\u{1F1F1}",
  "Paraguay": "\u{1F1F5}\u{1F1FE}",
  "Chile": "\u{1F1E8}\u{1F1F1}",
  "Perú": "\u{1F1F5}\u{1F1EA}",
  "Bolivia": "\u{1F1E7}\u{1F1F4}",
  "Venezuela": "\u{1F1FB}\u{1F1EA}",
  "Italia": "\u{1F1EE}\u{1F1F9}",
  "Sudáfrica": "\u{1F1FF}\u{1F1E6}",
  "Egipto": "\u{1F1EA}\u{1F1EC}",
  "Argelia": "\u{1F1E9}\u{1F1FF}",
  "Rusia": "\u{1F1F7}\u{1F1FA}",
  "Ucrania": "\u{1F1FA}\u{1F1E6}",
  "Suecia": "\u{1F1F8}\u{1F1EA}",
  "Noruega": "\u{1F1F3}\u{1F1F4}",
  "Austria": "\u{1F1E6}\u{1F1F9}",
  "Escocia": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
  "Jamaica": "\u{1F1EF}\u{1F1F2}",
  "Honduras": "\u{1F1ED}\u{1F1F3}",
  "Panamá": "\u{1F1F5}\u{1F1E6}",
  "China": "\u{1F1E8}\u{1F1F3}",
  "India": "\u{1F1EE}\u{1F1F3}",
};

function getFlag(country: string): string {
  return COUNTRY_FLAGS[country] || "\u{1F3F3}\u{FE0F}";
}

interface Toast {
  message: string;
  type: "success" | "error";
}

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

  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = () => {
    api.get("/players/").then((r) => setPlayers(r.data));
    api.get("/match-days/").then((r) => setMatchDays(r.data));
  };
  useEffect(load, []);

  const addPlayer = async () => {
    try {
      await api.post("/players/", { name: pName, country: pCountry, position: pPosition });
      setPName(""); setPCountry("");
      showToast("Jugador agregado correctamente", "success");
      load();
    } catch (e: any) {
      showToast(e.response?.data?.detail || "Error al agregar jugador", "error");
    }
  };

  const addMatchDay = async () => {
    try {
      await api.post("/match-days/", { name: mdName, deadline: mdDeadline });
      setMdName(""); setMdDeadline("");
      showToast("Fecha creada correctamente", "success");
      load();
    } catch (e: any) {
      showToast(e.response?.data?.detail || "Error al crear fecha", "error");
    }
  };

  const addScore = async () => {
    try {
      await api.post(`/match-days/${selectedMd}/scores`, [{
        player_id: selectedPlayer, goals, assists, yellow_cards: yellowCards,
        red_cards: redCards, clean_sheet: cleanSheet, own_goals: ownGoals, minutes_played: minutesPlayed,
      }]);
      showToast("Puntos cargados correctamente", "success");
      setGoals(0); setAssists(0); setYellowCards(0); setRedCards(0);
      setCleanSheet(false); setOwnGoals(0); setMinutesPlayed(0);
    } catch (e: any) {
      showToast(e.response?.data?.detail || "Error al cargar puntos", "error");
    }
  };

  return (
    <div className="page">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}

      <Link to="/" className="back-link">← Volver al inicio</Link>
      <h2>Panel de Administración</h2>

      <div className="admin-tabs">
        <button className={tab === "players" ? "active" : ""} onClick={() => setTab("players")}>
          ⚽ Jugadores
        </button>
        <button className={tab === "matchdays" ? "active" : ""} onClick={() => setTab("matchdays")}>
          📅 Fechas
        </button>
        <button className={tab === "scores" ? "active" : ""} onClick={() => setTab("scores")}>
          📊 Cargar Puntos
        </button>
      </div>

      {tab === "players" && (
        <div className="admin-section">
          <h3>Agregar jugador</h3>
          <div className="admin-form-row">
            <input placeholder="Nombre" value={pName} onChange={(e) => setPName(e.target.value)} />
            <input placeholder="País" value={pCountry} onChange={(e) => setPCountry(e.target.value)} />
            <select value={pPosition} onChange={(e) => setPPosition(e.target.value)}>
              <option value="arquero">Arquero</option>
              <option value="defensor">Defensor</option>
              <option value="mediocampista">Mediocampista</option>
              <option value="delantero">Delantero</option>
            </select>
            <button onClick={addPlayer}>Agregar</button>
          </div>

          <h3>Jugadores</h3>
          <p className="admin-player-count">{players.length} jugadores registrados</p>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>País</th>
                  <th>Posición</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{getFlag(p.country)} {p.country}</td>
                    <td><span className={`badge badge-${p.position}`}>{POSITION_LABELS[p.position] || p.position}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "matchdays" && (
        <div className="admin-section">
          <h3>Crear fecha</h3>
          <div className="admin-form-row">
            <input placeholder="Nombre (ej: Fecha 1)" value={mdName} onChange={(e) => setMdName(e.target.value)} />
            <input type="datetime-local" value={mdDeadline} onChange={(e) => setMdDeadline(e.target.value)} />
            <button onClick={addMatchDay} style={{ gridColumn: "span 2" }}>Crear fecha</button>
          </div>

          <h3>Fechas</h3>
          <p className="admin-player-count">{matchDays.length} fechas creadas</p>
          {matchDays.length > 0 ? (
            matchDays.map((md) => (
              <div key={md.id} className="admin-matchday-item">
                <span className="md-name">📅 {md.name}</span>
                <span className="md-date">{new Date(md.deadline).toLocaleString("es-AR")}</span>
              </div>
            ))
          ) : (
            <p style={{ color: "#5a6a7a", textAlign: "center", padding: "1rem" }}>
              No hay fechas creadas
            </p>
          )}
        </div>
      )}

      {tab === "scores" && (
        <div className="admin-section">
          <h3>Cargar puntos</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <select value={selectedMd} onChange={(e) => setSelectedMd(Number(e.target.value))}>
              <option value={0}>Seleccionar fecha</option>
              {matchDays.map((md) => <option key={md.id} value={md.id}>{md.name}</option>)}
            </select>
            <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(Number(e.target.value))}>
              <option value={0}>Seleccionar jugador</option>
              {players.map((p) => <option key={p.id} value={p.id}>{getFlag(p.country)} {p.name} ({p.country})</option>)}
            </select>
          </div>

          <div className="score-grid">
            <label>
              Goles
              <input type="number" value={goals} onChange={(e) => setGoals(Number(e.target.value))} min={0} />
            </label>
            <label>
              Asistencias
              <input type="number" value={assists} onChange={(e) => setAssists(Number(e.target.value))} min={0} />
            </label>
            <label>
              Amarillas
              <input type="number" value={yellowCards} onChange={(e) => setYellowCards(Number(e.target.value))} min={0} />
            </label>
            <label>
              Rojas
              <input type="number" value={redCards} onChange={(e) => setRedCards(Number(e.target.value))} min={0} />
            </label>
            <label>
              Goles en contra
              <input type="number" value={ownGoals} onChange={(e) => setOwnGoals(Number(e.target.value))} min={0} />
            </label>
            <label>
              Minutos jugados
              <input type="number" value={minutesPlayed} onChange={(e) => setMinutesPlayed(Number(e.target.value))} min={0} />
            </label>
          </div>
          <label style={{ marginTop: "0.5rem" }}>
            <input type="checkbox" checked={cleanSheet} onChange={(e) => setCleanSheet(e.target.checked)} style={{ width: "auto" }} />
            Valla invicta
          </label>

          <button onClick={addScore} disabled={!selectedMd || !selectedPlayer} style={{ marginTop: "0.5rem" }}>
            Cargar puntos
          </button>
        </div>
      )}
    </div>
  );
}
