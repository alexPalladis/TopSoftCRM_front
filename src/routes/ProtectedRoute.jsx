import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  const token = localStorage.getItem("token");

  // Έλεγξε και το token στο localStorage — όχι μόνο το state
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
