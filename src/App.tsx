import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TeamPage from "./pages/TeamPage";
import LeaguesPage from "./pages/LeaguesPage";
import StandingsPage from "./pages/StandingsPage";
import AdminPage from "./pages/AdminPage";
import "./App.css";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Cargando...</p>;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Cargando...</p>;
  if (!user) return <Navigate to="/login" />;
  if (!user.is_admin) return <Navigate to="/" />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <p>Cargando...</p>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/team" element={<PrivateRoute><TeamPage /></PrivateRoute>} />
      <Route path="/leagues" element={<PrivateRoute><LeaguesPage /></PrivateRoute>} />
      <Route path="/leagues/:leagueId" element={<PrivateRoute><StandingsPage /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
