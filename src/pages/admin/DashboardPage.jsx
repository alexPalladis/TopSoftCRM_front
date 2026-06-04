import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export default function DashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [custRes, dealerRes, networkRes, ticketRes] = await Promise.all([
          customersApi.getAll({ page: 0, size: 5 }),
          dealersApi.getAll({ page: 0, size: 1, active: true }),
          networksApi.getAll({ page: 0, size: 1 }),
          ticketsApi.pendingCount(),
        ]);

        setStats({
          totalCustomers: custRes.data.totalElements,
          totalDealers: dealerRes.data.totalElements,
          totalNetworks: networkRes.data.totalElements,
          pendingTickets: ticketRes.data,
        });

        setCustomers(custRes.data.content);
      } catch {
        setError("Σφάλμα φόρτωσης δεδομένων");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = stats
    ? [
        {
          label: "ΣΥΝΟΛΟ ΠΕΛΑΤΩΝ",
          value: stats.totalCustomers.toLocaleString("el-GR"),
          icon: <PeopleIcon />,
          color: "#3b82f6",
          delta: "",
          up: true,
        },
        {
          label: "ΕΝΕΡΓΟΙ DEALERS",
          value: stats.totalDealers.toLocaleString("el-GR"),
          icon: <StoreIcon />,
          color: "#22c55e",
          delta: "",
          up: true,
        },
        {
          label: "NETWORKS",
          value: stats.totalNetworks.toLocaleString("el-GR"),
          icon: <HubIcon />,
          color: "#8b5cf6",
          delta: "Σύνολο",
          up: false,
        },
        {
          icon: <WarningAmberIcon />,
          label: "ΑΙΤΗΜΑΤΑ",
          value: stats.pendingTickets.toLocaleString("el-GR"),
          color: stats.pendingTickets > 0 ? "#ef4444" : "#22c55e",
          delta:
            stats.pendingTickets > 0 ? "Χρειάζεται προσοχή" : "Όλα εντάξει",
          up: false,
          alert: stats.pendingTickets > 0,
        },
      ]
    : [];

  if (loading) {
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats */}
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
                cursor: s.label === "Εκκρεμή αιτήματα" ? "pointer" : "default",
              }}
              onClick={() =>
                s.label === "Εκκρεμή αιτήματα" && navigate("/requests")
              }
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1.5,
                }}
              >
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
                <Box sx={{ color: s.color, opacity: 0.7 }}>{s.icon}</Box>
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
              {s.delta && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mt: 1,
                  }}
                >
                  {s.up && (
                    <TrendingUpIcon sx={{ fontSize: 14, color: "#16a34a" }} />
                  )}
                  {s.alert && (
                    <WarningAmberIcon sx={{ fontSize: 14, color: "#ef4444" }} />
                  )}
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: s.alert ? "#ef4444" : s.up ? "#16a34a" : "#9ca3af",
                    }}
                  >
                    {s.delta}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent customers */}
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
                {["ΑΦΜ", "Επωνυμία", "Πόλη", "Dealer", "Κατάσταση", "Πηγή"].map(
                  (h) => (
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
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
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
                        label={c.active ? "Ενεργός" : "Ανενεργός"}
                        size="small"
                        sx={{
                          fontSize: 11,
                          height: 22,
                          background: c.active ? "#dcfce7" : "#fee2e2",
                          color: c.active ? "#166534" : "#991b1b",
                        }}
                      />
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <Chip
                        label={c.source}
                        size="small"
                        sx={{
                          fontSize: 11,
                          height: 22,
                          background:
                            c.source === "API" ? "#dbeafe" : "#f3f4f6",
                          color: c.source === "API" ? "#1e40af" : "#6b7280",
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
