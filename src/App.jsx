import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

// ─── LoginPage is NOT lazy — it's the entry point, loads immediately ───────
import LoginPage from "./pages/login/LoginPage";

// ─── Layout is NOT lazy — it wraps every protected page ────────────────────
import AdminLayout from "./components/layout/AdminLayout";

// ─── ADMIN pages (lazy) ────────────────────────────────────────────────────
const DashboardPage = lazy(() => import("./components/shared/DashboardPage"));
const CustomersPage = lazy(() => import("./pages/admin/CustomersPage"));
const CustomerFormPage = lazy(() => import("./pages/admin/CustomerFormPage"));
const DealersPage = lazy(() => import("./pages/admin/DealersPage"));
const DealerFormPage = lazy(() => import("./pages/admin/DealerFormPage"));
const NetworksPage = lazy(() => import("./pages/admin/NetworksPage"));
const NetworkFormPage = lazy(() => import("./pages/admin/NetworkFormPage"));
const SubDealersPage = lazy(() => import("./pages/admin/SubDealersPage"));
const SubDealerFormPage = lazy(() => import("./pages/admin/SubDealerFormPage"));
const RequestsPage = lazy(() => import("./pages/admin/RequestsPage"));
const CommissionsPage = lazy(() => import("./pages/admin/CommissionsPage"));
const PricelistPage = lazy(() => import("./pages/admin/PricelistPage"));
const ProfilePage = lazy(() => import("./pages/admin/ProfilePage"));

// ─── NETWORK pages (lazy) ──────────────────────────────────────────────────
const NetworkCustomersPage = lazy(
  () => import("./pages/network/NetworkCustomersPage"),
);
const NetworkDealersPage = lazy(
  () => import("./pages/network/NetworkDealersPage"),
);
const NetworkDealerFormPage = lazy(
  () => import("./pages/network/NetworkDealerFormPage"),
);
const NetworkSubDealersPage = lazy(
  () => import("./pages/network/NetworkSubDealersPage"),
);
const NetworkRequestsPage = lazy(
  () => import("./pages/network/NetworkRequestsPage"),
);
const NetworkCommissionsPage = lazy(
  () => import("./pages/network/NetworkCommissionsPage"),
);
const NetworkPricelistPage = lazy(
  () => import("./pages/network/NetworkPricelistPage"),
);

// ─── DEALER pages (lazy) ───────────────────────────────────────────────────
const DealerCustomersPage = lazy(
  () => import("./pages/dealer/DealerCustomersPage"),
);
const DealerSubDealersPage = lazy(
  () => import("./pages/dealer/DealerSubDealersPage"),
);
const DealerRequestsPage = lazy(
  () => import("./pages/dealer/DealerRequestsPage"),
);
const DealerPricelistPage = lazy(
  () => import("./pages/dealer/DealerPricelistPage"),
);
const DealerCommissionsPage = lazy(
  () => import("./pages/dealer/DealerCommissionsPage"),
);
const DealerSubDealerFormPage = lazy(
  () => import("./pages/dealer/DealerSubDealerFormPage"),
);
const DealerProfilePage = lazy(
  () => import("./pages/dealer/DealerProfilePage"),
);

const SubDealerCustomersPage = lazy(
  () => import("./pages/subdealer/SubDealerCustomersPage"),
);

const SubDealerRequestsPage = lazy(
  () => import("./pages/subdealer/SubDealerRequestsPage"),
);

// ─── Page loader — shown by Suspense while a chunk is downloading ──────────
function PageLoader() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d1117",
      }}
    >
      <CircularProgress size={32} sx={{ color: "#1f6feb" }} />
    </Box>
  );
}

// ─── RolePage — renders the correct page component based on user role ──────
// Used for routes that have a different page per role (same URL, diff UI).
function RolePage({ pages }) {
  const { user } = useAuth();
  const Page = pages[user?.role] || pages["ADMIN"] || Object.values(pages)[0];
  return <Page />;
}

// ─── LoginPageRouter — redirects to dashboard if already logged in ─────────
function LoginPageRouter() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}

// ─── App ───────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/*
          Suspense must wrap the Routes so it catches lazy chunks
          for every route transition, not just the initial load.
        */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public ── */}
            <Route path="/login" element={<LoginPageRouter />} />

            {/* ── Protected — all children share AdminLayout ── */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* Dashboard — all roles, content differs internally */}
              <Route path="dashboard" element={<DashboardPage />} />

              {/* ── Profile — all roles ── */}
              <Route
                path="profile"
                element={
                  <RolePage
                    pages={{
                      ADMIN: ProfilePage,
                      NETWORK: ProfilePage,
                      DEALER: DealerProfilePage,
                      SUBDEALER: DealerProfilePage,
                    }}
                  />
                }
              />

              {/* ── Customers ── */}
              <Route
                path="customers"
                element={
                  <RolePage
                    pages={{
                      ADMIN: CustomersPage,
                      NETWORK: NetworkCustomersPage,
                      DEALER: DealerCustomersPage,
                      SUBDEALER: SubDealerCustomersPage,
                    }}
                  />
                }
              />
              <Route path="customers/new" element={<CustomerFormPage />} />
              <Route path="customers/:id/edit" element={<CustomerFormPage />} />

              {/* ── Networks — ADMIN only ── */}
              <Route
                path="networks"
                element={
                  <RoleRoute allowedRoles={["ADMIN"]}>
                    <NetworksPage />
                  </RoleRoute>
                }
              />
              <Route
                path="networks/new"
                element={
                  <RoleRoute allowedRoles={["ADMIN"]}>
                    <NetworkFormPage />
                  </RoleRoute>
                }
              />
              <Route
                path="networks/:id/edit"
                element={
                  <RoleRoute allowedRoles={["ADMIN"]}>
                    <NetworkFormPage />
                  </RoleRoute>
                }
              />

              {/* ── Dealers — ADMIN + NETWORK ── */}
              <Route
                path="dealers"
                element={
                  <RoleRoute allowedRoles={["ADMIN", "NETWORK", "DEALER"]}>
                    <RolePage
                      pages={{
                        ADMIN: DealersPage,
                        NETWORK: NetworkDealersPage,
                        DEALER: DealersPage, // TODO: DealerSelfPage
                      }}
                    />
                  </RoleRoute>
                }
              />
              <Route
                path="dealers/new"
                element={
                  <RoleRoute allowedRoles={["ADMIN", "NETWORK"]}>
                    <RolePage
                      pages={{
                        ADMIN: DealerFormPage,
                        NETWORK: NetworkDealerFormPage,
                      }}
                    />
                  </RoleRoute>
                }
              />
              <Route
                path="dealers/:id/edit"
                element={
                  <RoleRoute allowedRoles={["ADMIN", "NETWORK"]}>
                    <RolePage
                      pages={{
                        ADMIN: DealerFormPage,
                        NETWORK: NetworkDealerFormPage,
                      }}
                    />
                  </RoleRoute>
                }
              />

              {/* ── SubDealers — ADMIN + NETWORK + DEALER ── */}
              <Route
                path="subdealers"
                element={
                  <RoleRoute allowedRoles={["ADMIN", "NETWORK", "DEALER"]}>
                    <RolePage
                      pages={{
                        ADMIN: SubDealersPage,
                        NETWORK: NetworkSubDealersPage,
                        DEALER: DealerSubDealersPage,
                      }}
                    />
                  </RoleRoute>
                }
              />
              <Route
                path="subdealers/new"
                element={
                  <RoleRoute allowedRoles={["ADMIN", "NETWORK", "DEALER"]}>
                    <RolePage
                      pages={{
                        ADMIN: SubDealerFormPage,
                        NETWORK: SubDealerFormPage, // TODO: NetworkSubDealerFormPage
                        DEALER: DealerSubDealerFormPage,
                      }}
                    />
                  </RoleRoute>
                }
              />
              <Route
                path="subdealers/:id/edit"
                element={
                  <RoleRoute allowedRoles={["ADMIN", "NETWORK", "DEALER"]}>
                    <RolePage
                      pages={{
                        ADMIN: SubDealerFormPage,
                        NETWORK: SubDealerFormPage, // TODO: NetworkSubDealerFormPage
                        DEALER: DealerSubDealerFormPage,
                      }}
                    />
                  </RoleRoute>
                }
              />

              {/* ── Requests — all roles ── */}
              <Route
                path="requests"
                element={
                  <RolePage
                    pages={{
                      ADMIN: RequestsPage,
                      NETWORK: NetworkRequestsPage,
                      DEALER: DealerRequestsPage,
                      SUBDEALER: SubDealerRequestsPage,
                    }}
                  />
                }
              />

              {/* ── Commissions — ADMIN + NETWORK + DEALER ── */}
              <Route
                path="commissions"
                element={
                  <RoleRoute allowedRoles={["ADMIN", "NETWORK", "DEALER"]}>
                    <RolePage
                      pages={{
                        ADMIN: CommissionsPage,
                        NETWORK: NetworkCommissionsPage,
                        DEALER: DealerCommissionsPage,
                      }}
                    />
                  </RoleRoute>
                }
              />

              {/* ── Pricelist — ADMIN + NETWORK ── */}
              <Route
                path="pricelist"
                element={
                  <RoleRoute allowedRoles={["ADMIN", "NETWORK", "DEALER"]}>
                    <RolePage
                      pages={{
                        ADMIN: PricelistPage,
                        NETWORK: NetworkPricelistPage,
                        DEALER: DealerPricelistPage,
                      }}
                    />
                  </RoleRoute>
                }
              />
            </Route>
            {/* end protected layout */}

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
