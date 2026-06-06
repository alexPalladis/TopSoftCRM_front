import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import {
  Grid,
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import HubIcon from "@mui/icons-material/Hub";
import StoreIcon from "@mui/icons-material/Store";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { customersApi } from "../../services/customers";
import { dealersApi } from "../../services/dealers";
import { networksApi } from "../../services/networks";
import { ticketsApi } from "../../services/tickets";
import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.role;

  /*
   * useQueries fires all four requests in parallel — same as your
   * Promise.all() approach, but results are cached per queryKey.
   *
   * On revisit within 60s (staleTime set in main.jsx):
   *   → stats render instantly from cache, no loading spinner.
   * After 60s:
   *   → cached data shows immediately, then silently revalidates in background.
   *
   * enabled: false skips the query entirely for roles that don't need it,
   * instead of resolving a dummy Promise.resolve(null).
   */
  const results = useQueries({
    queries: [
      {
        queryKey: ["dashboard", "customers"],
        queryFn: () => customersApi.getAll({ page: 0, size: 5 }),
      },
      {
        queryKey: ["dashboard", "dealers"],
        queryFn: () => dealersApi.getAll({ page: 0, size: 1 }),
        enabled: ["ADMIN", "NETWORK", "DEALER"].includes(role),
      },
      {
        queryKey: ["dashboard", "networks"],
        queryFn: () => networksApi.getAll({ page: 0, size: 1 }),
        enabled: ["ADMIN", "NETWORK"].includes(role),
      },
      {
        queryKey: ["dashboard", "pendingTickets"],
        queryFn: () => ticketsApi.pendingCount(),
      },
    ],
  });

  const [custQ, dealerQ, networkQ, ticketQ] = results;

  // Show full-page loader only on the very first load (no cached data yet)
  const isFirstLoad = results.some((q) => q.isLoading);
  // Show a soft error only if the primary customers query fails
  const hasError = custQ.isError;

  const stats = {
    totalCustomers: custQ.data?.data?.totalElements ?? 0,
    totalDealers: dealerQ.data?.data?.totalElements ?? 0,
    totalNetworks: networkQ.data?.data?.totalElements ?? 0,
    pendingTickets: ticketQ.data?.data ?? 0,
  };

  const customers = custQ.data?.data?.content ?? [];

  const statCards = [
    {
      label: "ΣΥΝΟΛΟ ΠΕΛΑΤΩΝ",
      value: stats.totalCustomers.toLocaleString("el-GR"),
      icon: <PeopleIcon />,
      color: "#3b82f6",
      delta: "",
      up: true,
      path: "/customers",
    },
    {
      label: "ΕΝΕΡΓΟΙ DEALERS",
      value: stats.totalDealers.toLocaleString("el-GR"),
      icon: <StoreIcon />,
      color: "#22c55e",
      delta: "",
      up: true,
      path: "/dealers",
    },
    {
      label: "Networks",
      value: stats.totalNetworks.toLocaleString("el-GR"),
      icon: <HubIcon />,
      color: "#8b5cf6",
      delta: "Σύνολο",
      up: false,
      path: "/networks",
    },
    {
      label: "ΕΚΚΡΕΜΗ ΑΙΤΗΜΑΤΑ",
      value: stats.pendingTickets.toLocaleString("el-GR"),
      icon: <WarningAmberIcon />,
      color: stats.pendingTickets > 0 ? "#ef4444" : "#22c55e",
      delta: stats.pendingTickets > 0 ? "Χρειάζεται προσοχή" : "Όλα εντάξει",
      up: false,
      alert: stats.pendingTickets > 0,
      path: "/requests",
    },
  ];

  if (isFirstLoad) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {hasError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Σφάλμα φόρτωσης δεδομένων
        </Alert>
      )}

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: "0.5px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
                transition: "box-shadow 0.15s",
                height: 130,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
              }}
              onClick={() => navigate(s.path)}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <Box sx={{ color: s.color, opacity: 0.7, display: "flex" }}>
                  {s.icon}
                </Box>
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: s.color,
                  fontFamily: "monospace",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {s.up && (
                  <TrendingUpIcon sx={{ fontSize: 14, color: "#16a34a" }} />
                )}
                {s.alert && (
                  <WarningAmberIcon sx={{ fontSize: 14, color: "#ef4444" }} />
                )}
                {s.delta && (
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: s.alert ? "#ef4444" : s.up ? "#16a34a" : "#9ca3af",
                    }}
                  >
                    {s.delta}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent Customers */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "0.5px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.8,
            borderBottom: "0.5px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
            Τελευταίοι πελάτες
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: "#3b82f6",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => navigate("/customers")}
          >
            Προβολή όλων →
          </Typography>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["ΑΦΜ", "Επωνυμία", "Πόλη", "Dealer", "Ενεργός"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 500,
                      borderBottom: "0.5px solid #f3f4f6",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: 40,
                      textAlign: "center",
                      color: "#9ca3af",
                      fontSize: 14,
                    }}
                  >
                    Δεν υπάρχουν πελάτες ακόμα
                  </td>
                </tr>
              ) : (
                customers.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom:
                        i < customers.length - 1
                          ? "0.5px solid #f3f4f6"
                          : "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                    onClick={() => navigate("/customers")}
                  >
                    <td
                      style={{
                        padding: "11px 16px",
                        fontFamily: "monospace",
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      {c.afm}
                    </td>
                    <td
                      style={{
                        padding: "11px 16px",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#111827",
                      }}
                    >
                      {c.eponymia}
                    </td>
                    <td
                      style={{
                        padding: "11px 16px",
                        fontSize: 13,
                        color: "#374151",
                      }}
                    >
                      {c.city}
                    </td>
                    <td
                      style={{
                        padding: "11px 16px",
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      {c.dealerName || "—"}
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <Chip
                        label={c.active ? "Ναι" : "Όχι"}
                        size="small"
                        sx={{
                          fontSize: 11,
                          height: 22,
                          background: c.active ? "#dcfce7" : "#fee2e2",
                          color: c.active ? "#166534" : "#991b1b",
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
}
