import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../services/api";

interface User {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
}

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/auth/me").then((r) => setUser(r.data)).catch(() => localStorage.removeItem("token")).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.access_token);
    const me = await api.get("/auth/me");
    setUser(me.data);
  };

  const register = async (email: string, password: string, username: string) => {
    await api.post("/auth/register", { email, password, username });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>;
}
