import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Only user metadata (id, username, role) — never the token — is stored here.
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password, id) => {
    // The server sets the HttpOnly cookie. We only receive user metadata in the body.
    const res = await api.post("/auth/login", { username, password, id });
    const userData = res.data; // { id, username, role } — no token
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      // Tell the server to clear the HttpOnly cookie
      await api.post("/auth/logout");
    } catch {
      // Even if the call fails, we clear client state
    }
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
