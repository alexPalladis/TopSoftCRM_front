import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

// ─── Helper: decode JWT expiry without a library ───────────────────────────
// A JWT is three base64url segments separated by dots.
// The payload (second segment) contains the `exp` claim (Unix seconds).
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    // exp is in seconds; Date.now() is in milliseconds
    return Date.now() >= payload.exp * 1000;
  } catch {
    // Malformed token — treat as expired
    return true;
  }
}

// ─── Helper: clear all auth data from localStorage ────────────────────────
function clearStorage() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Restore session from localStorage on mount.
  // If the token is expired, clean up immediately — don't restore a broken session.
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const saved = localStorage.getItem("user");

      if (token && saved && !isTokenExpired(token)) {
        setUser(JSON.parse(saved));
      } else if (token || saved) {
        // Token exists but is expired (or user data is missing) — clean up
        clearStorage();
      }
    } catch {
      clearStorage();
    }
    setReady(true);
  }, []);

  const login = async (username, password, id) => {
    const res = await api.post("/auth/login", { username, password, id });
    const { token, ...userData } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    clearStorage();
    setUser(null);
  };

  // Don't render children until we've checked localStorage
  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isTokenExpired }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Export the helper so ProtectedRoute can use it without re-importing
export { isTokenExpired };
