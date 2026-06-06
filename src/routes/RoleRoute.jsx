import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * RoleRoute
 *
 * Sits inside ProtectedRoute (so authentication is already confirmed).
 * Guards a route to only the roles listed in `allowedRoles`.
 *
 * If the current user's role is not in the list, they are silently
 * redirected to /dashboard instead of seeing an error page.
 *
 * Usage in your router:
 *
 *   <Route path="/networks" element={
 *     <ProtectedRoute>
 *       <RoleRoute allowedRoles={["ADMIN"]}>
 *         <NetworksPage />
 *       </RoleRoute>
 *     </ProtectedRoute>
 *   } />
 *
 *   <Route path="/dealers" element={
 *     <ProtectedRoute>
 *       <RoleRoute allowedRoles={["ADMIN", "NETWORK"]}>
 *         <DealersPage />
 *       </RoleRoute>
 *     </ProtectedRoute>
 *   } />
 *
 * Routes visible to ALL authenticated roles (dashboard, customers,
 * requests, profile) do NOT need RoleRoute — just ProtectedRoute.
 */
export default function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
