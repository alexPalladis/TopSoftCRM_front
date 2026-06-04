import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/Login/LoginPage";
import AdminLayout from "./components/layout/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import CustomersPage from "./pages/admin/CustomersPage";
import DealersPage from "./pages/admin/DealersPage";
import NetworksPage from "./pages/admin/NetworksPage";
import SubDealersPage from "./pages/admin/SubDealersPage";
import RequestsPage from "./pages/admin/RequestsPage";
import CommissionsPage from "./pages/admin/CommissionsPage";
import PricelistPage from "./pages/admin/PricelistPage";
import NewCustomerPage from "./pages/admin/NewCustomerPage";
import NewDealerPage from "./pages/admin/NewDealerPage";
import NewNetworkPage from "./pages/admin/NewNetworkPage";
import NewSubDealerPage from "./pages/admin/NewSubDealerPage";
import ProfilePage from "./pages/admin/ProfilePage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/new" element={<NewCustomerPage />} />
            <Route path="dealers" element={<DealersPage />} />
            <Route path="dealers/new" element={<NewDealerPage />} />
            <Route path="networks" element={<NetworksPage />} />
            <Route path="networks/new" element={<NewNetworkPage />} />
            <Route path="subdealers" element={<SubDealersPage />} />
            <Route path="subdealers/new" element={<NewSubDealerPage />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="commissions" element={<CommissionsPage />} />
            <Route path="pricelist" element={<PricelistPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
