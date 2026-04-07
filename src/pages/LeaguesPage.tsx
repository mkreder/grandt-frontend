import { useState, useEffect } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";

interface League {
  id: number;
  name: string;
  code: string;
  owner_id: number;
  members: { id: number; username: string }[];
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const navigate = useNavigate();

  const load = () => api.get("/leagues/").then((r) => setLeagues(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!newName) return;
    setError("");
    try {
      await api.post("/leagues/", { name: newName });
      setNewName("");
      load();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Error");
    }
  };

  const join = async () => {
    if (!joinCode) return;
    setError("");
    try {
      await api.post("/leagues/join", { code: joinCode });
      setJoinCode("");
      load();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Liga no encontrada");
    }
  };

  const copyCode = (e: React.MouseEvent, code: string, id: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") create();
  };

  const handleJoinKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") join();
  };

  return (
    <div className="page">
      <Link to="/" className="back-link">← Volver al inicio</Link>
      <h2>Mis Ligas</h2>
      {error && <p className="error">{error}</p>}

      <div className="league-actions">
        <div>
          <h3>Crear liga</h3>
          <div className="inline-form">
            <input
              placeholder="Nombre de la liga"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleCreateKey}
            />
            <button onClick={create}>Crear</button>
          </div>
        </div>
        <div>
          <h3>Unirse a una liga</h3>
          <div className="inline-form">
            <input
              placeholder="Código de invitación"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={handleJoinKey}
            />
            <button onClick={join}>Unirse</button>
          </div>
        </div>
      </div>

      {leagues.length > 0 ? (
        <div className="league-list">
          {leagues.map((l) => (
            <div key={l.id} className="league-card" onClick={() => navigate(`/leagues/${l.id}`)}>
              <h3>🏆 {l.name}</h3>
              <div className="league-code">
                {l.code}
                <button
                  className="copy-btn"
                  onClick={(e) => copyCode(e, l.code, l.id)}
                  title="Copiar código"
                >
                  {copiedId === l.id ? "Copiado!" : "Copiar"}
                </button>
              </div>
              <div className="league-members">
                👥 {l.members.length} {l.members.length === 1 ? "miembro" : "miembros"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <p>No estás en ninguna liga todavia.</p>
          <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
            Creá una liga y compartí el código, o unite con un código de invitación.
          </p>
        </div>
      )}
    </div>
  );
}
