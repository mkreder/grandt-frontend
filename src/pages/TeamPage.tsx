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

export default function TeamPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [filter, setFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [search, setSearch] = useState("");
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

  const isValidFormation = POSITIONS.every((pos) => (posCount[pos] || 0) === REQUIRED[pos]) && selected.length === 11;

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
    (p) =>
      (!filter || p.position === filter) &&
      (!countryFilter || p.country === countryFilter) &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const getDisabledReason = (): string => {
    if (selected.length !== 11) return `Necesitás 11 jugadores (tenés ${selected.length})`;
    for (const pos of POSITIONS) {
      if ((posCount[pos] || 0) !== REQUIRED[pos]) {
        return `${POSITION_LABELS[pos]}: ${posCount[pos] || 0}/${REQUIRED[pos]}`;
      }
    }
    return "";
  };

  return (
    <div className="page">
      <Link to="/" className="back-link">← Volver al inicio</Link>
      <h2>Mi Equipo</h2>

      <div className="formation-summary">
        {POSITIONS.map((pos) => (
          <span key={pos} className={posCount[pos] === REQUIRED[pos] ? "ok" : ""}>
            <span className={`badge badge-${pos}`}>{POSITION_LABELS[pos].substring(0, 3).toUpperCase()}</span>{" "}
            {posCount[pos] || 0}/{REQUIRED[pos]}
          </span>
        ))}
        <strong>Total: {selected.length}/11</strong>
      </div>

      {selectedPlayers.length > 0 && (
        <div className="pitch">
          <div className="pitch-label">Delanteros</div>
          <div className="pitch-row">
            {selectedPlayers.filter((p) => p.position === "delantero").map((p) => (
              <div key={p.id} className="pitch-player">
                <div>{getFlag(p.country)} {p.name.split(" ").pop()}</div>
              </div>
            ))}
          </div>
          <div className="pitch-label">Mediocampistas</div>
          <div className="pitch-row">
            {selectedPlayers.filter((p) => p.position === "mediocampista").map((p) => (
              <div key={p.id} className="pitch-player">
                <div>{getFlag(p.country)} {p.name.split(" ").pop()}</div>
              </div>
            ))}
          </div>
          <div className="pitch-label">Defensores</div>
          <div className="pitch-row">
            {selectedPlayers.filter((p) => p.position === "defensor").map((p) => (
              <div key={p.id} className="pitch-player">
                <div>{getFlag(p.country)} {p.name.split(" ").pop()}</div>
              </div>
            ))}
          </div>
          <div className="pitch-label">Arquero</div>
          <div className="pitch-row">
            {selectedPlayers.filter((p) => p.position === "arquero").map((p) => (
              <div key={p.id} className="pitch-player">
                <div>{getFlag(p.country)} {p.name.split(" ").pop()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}
      {saved && <p className="success">Equipo guardado correctamente</p>}

      <div className="team-layout">
        <div className="player-list">
          <h3>Jugadores disponibles ({filtered.length})</h3>
          <input
            className="search-bar"
            type="text"
            placeholder="Buscar jugador por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="filters">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">Todas las posiciones</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>{POSITION_LABELS[p]}</option>
              ))}
            </select>
            <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              <option value="">Todos los paises</option>
              {countries.map((c) => (
                <option key={c} value={c}>{getFlag(c)} {c}</option>
              ))}
            </select>
          </div>
          <ul>
            {filtered.map((p) => (
              <li key={p.id} className={selected.includes(p.id) ? "selected" : ""} onClick={() => toggle(p.id)}>
                <span className="player-name">{getFlag(p.country)} {p.name}</span>
                <span className="player-info">
                  <span className={`badge badge-${p.position}`}>{POSITION_LABELS[p.position].substring(0, 3).toUpperCase()}</span>
                  {p.country}
                </span>
              </li>
            ))}
            {filtered.length === 0 && (
              <li style={{ justifyContent: "center", color: "#5a6a7a", cursor: "default" }}>
                No se encontraron jugadores
              </li>
            )}
          </ul>
        </div>

        <div className="selected-list">
          <h3>Tu equipo ({selected.length}/11)</h3>
          {POSITIONS.map((pos) => (
            <div key={pos}>
              <h4>
                <span className={`badge badge-${pos}`}>{POSITION_LABELS[pos].substring(0, 3).toUpperCase()}</span>
                {POSITION_LABELS[pos]} ({posCount[pos] || 0}/{REQUIRED[pos]})
              </h4>
              <ul>
                {selectedPlayers.filter((p) => p.position === pos).map((p) => (
                  <li key={p.id} onClick={() => toggle(p.id)}>
                    <span>{getFlag(p.country)} {p.name}</span>
                    <span className="remove-icon">✕</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div style={{ marginTop: "1rem" }}>
            <button onClick={save} disabled={!isValidFormation} style={{ width: "100%" }}>
              Confirmar equipo
            </button>
            {!isValidFormation && selected.length > 0 && (
              <p style={{ color: "#7a8a9a", fontSize: "0.8rem", marginTop: "0.5rem", textAlign: "center" }}>
                {getDisabledReason()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
