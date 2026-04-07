import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header>
        <h1>GranDT Mundial ⚽</h1>
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
    </div>
  );
}
