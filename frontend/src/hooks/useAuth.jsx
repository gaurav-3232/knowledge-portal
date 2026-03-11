import React from "react";
import api from "../api";

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = React.useState(() => localStorage.getItem("kp_token"));
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch current user info on mount / token change
  React.useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    api
      .get("/api/users/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("kp_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (username, password) => {
    const res = await api.post("/api/login", { username, password });
    const { token: t, role } = res.data;
    localStorage.setItem("kp_token", t);
    setToken(t);
    return { role };
  };

  const logout = () => {
    localStorage.removeItem("kp_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
