import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, username);
      navigate("/");
    } catch {
      setError("Error al registrar. Email o usuario ya existe.");
    }
  };

  return (
    <div className="auth-page">
      <h1>GranDT Mundial ⚽</h1>
      <form onSubmit={handleSubmit}>
        <h2>Registro</h2>
        {error && <p className="error">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Nombre de usuario" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Registrarme</button>
        <p>¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></p>
      </form>
    </div>
  );
}
