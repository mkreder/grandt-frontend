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
  const navigate = useNavigate();

  const load = () => api.get("/leagues/").then((r) => setLeagues(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!newName) return;
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
    try {
      await api.post("/leagues/join", { code: joinCode });
      setJoinCode("");
      load();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Liga no encontrada");
    }
  };

  return (
    <div className="page">
      <Link to="/">← Volver</Link>
      <h2>Mis Ligas</h2>
      {error && <p className="error">{error}</p>}

      <div className="league-actions">
        <div>
          <h3>Crear liga</h3>
          <input placeholder="Nombre de la liga" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button onClick={create}>Crear</button>
        </div>
        <div>
          <h3>Unirse a una liga</h3>
          <input placeholder="Código de invitación" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
          <button onClick={join}>Unirse</button>
        </div>
      </div>

      <div className="league-list">
        {leagues.map((l) => (
          <div key={l.id} className="league-card" onClick={() => navigate(`/leagues/${l.id}`)}>
            <h3>{l.name}</h3>
            <p>Código: <strong>{l.code}</strong></p>
            <p>{l.members.length} miembros</p>
          </div>
        ))}
        {leagues.length === 0 && <p>No estás en ninguna liga todavía.</p>}
      </div>
    </div>
  );
}
