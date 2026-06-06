import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isTokenExpired } from "../context/AuthContext";

/**
 * ProtectedRoute
 *
 * Guards any route that requires authentication.
 * Checks three things in order:
 *  1. Is there a user in context AND a token in storage?
 *  2. Is the token still valid (not expired)?
 *  3. If expired → clean up and redirect to login.
 *
 * Note: role-level access (which roles can see which pages)
 * is handled separately by RoleRoute.
 */
export default function ProtectedRoute({ children }) {
  const { user, logout } = useAuth();
  const token = localStorage.getItem("token");

  // No session at all → go to login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists but has expired → clean up and go to login
  if (isTokenExpired(token)) {
    logout(); // clears localStorage and resets user state
    return <Navigate to="/login" replace />;
  }

  return children;
}
