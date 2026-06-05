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
import ProfilePage from "./pages/admin/ProfilePage";
import CustomerFormPage from "./pages/admin/CustomerFormPage";
import NetworkFormPage from "./pages/admin/NetworkFormPage";
import DealerFormPage from "./pages/admin/DealerFormPage";
import SubDealerFormPage from "./pages/admin/SubDealerFormPage";

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
            <Route path="customers/new" element={<CustomerFormPage />} />
            <Route path="customers/:id/edit" element={<CustomerFormPage />} />
            <Route path="dealers" element={<DealersPage />} />
            <Route path="dealers/new" element={<DealerFormPage />} />
            <Route path="dealers/:id/edit" element={<DealerFormPage />} />
            <Route path="networks" element={<NetworksPage />} />
            <Route path="networks/new" element={<NetworkFormPage />} />
            <Route path="networks/:id/edit" element={<NetworkFormPage />} />
            <Route path="subdealers" element={<SubDealersPage />} />
            <Route path="subdealers/new" element={<SubDealerFormPage />} />
            <Route path="subdealers/:id/edit" element={<SubDealerFormPage />} />
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
