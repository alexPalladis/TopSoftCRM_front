import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/login/LoginPage";

// Layout
import AdminLayout from "./components/layout/AdminLayout";

// ─── ADMIN pages ───────────────────────────────────────────────
import DashboardPage from "./pages/admin/DashboardPage";
import CustomersPage from "./pages/admin/CustomersPage";
import CustomerFormPage from "./pages/admin/CustomerFormPage";
import DealersPage from "./pages/admin/DealersPage";
import DealerFormPage from "./pages/admin/DealerFormPage";
import NetworksPage from "./pages/admin/NetworksPage";
import NetworkFormPage from "./pages/admin/NetworkFormPage";
import SubDealersPage from "./pages/admin/SubDealersPage";
import SubDealerFormPage from "./pages/admin/SubDealerFormPage";
import RequestsPage from "./pages/admin/RequestsPage";
import CommissionsPage from "./pages/admin/CommissionsPage";
import PricelistPage from "./pages/admin/PricelistPage";
import ProfilePage from "./pages/admin/ProfilePage";

// ─── NETWORK pages ─────────────────────────────────────────────
import NetworkCustomersPage from "./pages/network/NetworkCustomersPage";
import NetworkDealersPage from "./pages/network/NetworkDealersPage";
import NetworkDealerFormPage from "./pages/network/NetworkDealerFormPage";

import NetworkSubDealersPage from "./pages/network/NetworkSubDealersPage";
// import NetworkSubDealerFormPage from './pages/network/NetworkSubDealerFormPage'
import NetworkRequestsPage from "./pages/network/NetworkRequestsPage";
import NetworkCommissionsPage from "./pages/network/NetworkCommissionsPage";
import NetworkPricelistPage from "./pages/network/NetworkPricelistPage";

import DealerCustomersPage from "./pages/dealer/DealerCustomersPage";
import DealerSubDealersPage from "./pages/dealer/DealerSubDealersPage";
// import DealerSubDealerFormPage  from './pages/dealer/DealerSubDealerFormPage'
// import DealerRequestsPage       from './pages/dealer/DealerRequestsPage'
// import DealerCommissionsPage    from './pages/dealer/DealerCommissionsPage'
// import DealerPricelistPage      from './pages/dealer/DealerPricelistPage'

// ─── SUBDEALER pages ───────────────────────────────────────────
// TODO — θα προστεθούν όταν φτιαχτούν:
// import SubDealerCustomersPage   from './pages/subdealer/SubDealerCustomersPage'
// import SubDealerRequestsPage    from './pages/subdealer/SubDealerRequestsPage'
// import SubDealerCommissionsPage from './pages/subdealer/SubDealerCommissionsPage'

// ─── RolePage helper ───────────────────────────────────────────
function RolePage({ pages }) {
  const { user } = useAuth();
  const Page = pages[user?.role] || pages["ADMIN"] || Object.values(pages)[0];
  return <Page />;
}

// ─── App ───────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPageRouter />} />

          {/* Protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard — κοινό, διαφορετικό περιεχόμενο ανά ρόλο μέσα */}
            <Route path="dashboard" element={<DashboardPage />} />

            {/* ── Customers ── */}
            <Route
              path="customers"
              element={
                <RolePage
                  pages={{
                    ADMIN: CustomersPage,
                    NETWORK: NetworkCustomersPage,
                    DEALER: DealerCustomersPage,
                    SUBDEALER: CustomersPage, // TODO: SubDealerCustomersPage
                  }}
                />
              }
            />
            <Route path="customers/new" element={<CustomerFormPage />} />
            <Route path="customers/:id/edit" element={<CustomerFormPage />} />

            {/* ── Dealers ── */}
            <Route
              path="dealers"
              element={
                <RolePage
                  pages={{
                    ADMIN: DealersPage,
                    NETWORK: NetworkDealersPage,
                    DEALER: DealersPage, // TODO: DealerSelfPage
                  }}
                />
              }
            />
            <Route
              path="dealers/new"
              element={
                <RolePage
                  pages={{
                    ADMIN: DealerFormPage,
                    NETWORK: NetworkDealerFormPage,
                  }}
                />
              }
            />
            <Route
              path="dealers/:id/edit"
              element={
                <RolePage
                  pages={{
                    ADMIN: DealerFormPage,
                    NETWORK: NetworkDealerFormPage,
                  }}
                />
              }
            />

            {/* ── Networks ── */}
            <Route path="networks" element={<NetworksPage />} />
            <Route path="networks/new" element={<NetworkFormPage />} />
            <Route path="networks/:id/edit" element={<NetworkFormPage />} />

            {/* ── SubDealers ── */}
            <Route
              path="subdealers"
              element={
                <RolePage
                  pages={{
                    ADMIN: SubDealersPage,
                    NETWORK: NetworkSubDealersPage,
                    DEALER: DealerSubDealersPage,
                  }}
                />
              }
            />
            <Route
              path="subdealers/new"
              element={
                <RolePage
                  pages={{
                    ADMIN: SubDealerFormPage,
                    NETWORK: SubDealerFormPage, // TODO: NetworkSubDealerFormPage
                    DEALER: SubDealerFormPage, // TODO: DealerSubDealerFormPage
                  }}
                />
              }
            />
            <Route
              path="subdealers/:id/edit"
              element={
                <RolePage
                  pages={{
                    ADMIN: SubDealerFormPage,
                    NETWORK: SubDealerFormPage, // TODO: NetworkSubDealerFormPage
                    DEALER: SubDealerFormPage, // TODO: DealerSubDealerFormPage
                  }}
                />
              }
            />

            {/* ── Requests ── */}
            <Route
              path="requests"
              element={
                <RolePage
                  pages={{
                    ADMIN: RequestsPage,
                    NETWORK: NetworkRequestsPage,
                    DEALER: RequestsPage, // TODO: DealerRequestsPage
                    SUBDEALER: RequestsPage, // TODO: SubDealerRequestsPage
                  }}
                />
              }
            />

            {/* ── Commissions ── */}
            <Route
              path="commissions"
              element={
                <RolePage
                  pages={{
                    ADMIN: CommissionsPage,
                    NETWORK: NetworkCommissionsPage,
                    DEALER: CommissionsPage, // TODO: DealerCommissionsPage
                  }}
                />
              }
            />

            {/* ── Pricelist ── */}
            <Route
              path="pricelist"
              element={
                <RolePage
                  pages={{
                    ADMIN: PricelistPage,
                    NETWORK: NetworkPricelistPage,
                    DEALER: PricelistPage, // TODO: DealerPricelistPage
                  }}
                />
              }
            />

            {/* ── Profile — κοινό για όλους ── */}
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Login router — αν είσαι ήδη logged in πήγαινε στο dashboard
function LoginPageRouter() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}
