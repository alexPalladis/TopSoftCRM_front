import { useNavigate } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Skeleton,
  Divider,
} from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import HubIcon from "@mui/icons-material/Hub";
import StoreIcon from "@mui/icons-material/Store";
import PersonIcon from "@mui/icons-material/Person";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { customersApi } from "../../services/customers";
import { dealersApi } from "../../services/dealers";
import { networksApi } from "../../services/networks";
import { subdealersApi } from "../../services/subdealers";
import { ticketsApi } from "../../services/tickets";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const DEALER_COLOR = "#3b82f6";
const NETWORK_COLOR = "#8b5cf6";
const ACTIVE_COLOR = "#22c55e";
const INACTIVE_COLOR = "#e5e7eb";

// ── Tooltip ──────────────────────────────────────────────────────────────────
function CommissionTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        background: "#fff",
        border: "0.5px solid #e5e7eb",
        borderRadius: 2,
        p: 1.5,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          color: "#6b7280",
          mb: 0.8,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </Typography>
      {payload.map((p) => (
        <Box
          key={p.name}
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}
        >
          <Box
            sx={{ width: 8, height: 2, borderRadius: 1, background: p.color }}
          />
          <Typography sx={{ fontSize: 12, color: "#374151" }}>
            {p.name}:&nbsp;
            <span style={{ fontWeight: 700 }}>
              €
              {Number(p.value).toLocaleString("el-GR", {
                minimumFractionDigits: 0,
              })}
            </span>
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function ChartSkeleton({ height = 180 }) {
  return (
    <Skeleton
      variant="rectangular"
      height={height}
      sx={{ borderRadius: 1, mt: 1 }}
    />
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, delta, alert, up, onClick }) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "0.5px solid #e5e7eb",
        cursor: "pointer",
        flex: 1,
        minWidth: 0,
        transition: "box-shadow 0.15s, border-color 0.15s",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
          borderColor: "#d1d5db",
        },
      }}
    >
      {/* Icon + label */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1.5 }}>
        <Box sx={{ color, opacity: 0.75, display: "flex", fontSize: 18 }}>
          {icon}
        </Box>
        <Typography
          sx={{
            fontSize: 10,
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          {label}
        </Typography>
      </Box>
      {/* Value */}
      <Typography
        sx={{
          fontSize: 30,
          fontWeight: 700,
          color,
          fontFamily: "monospace",
          lineHeight: 1,
          mb: 1,
        }}
      >
        {value}
      </Typography>
      {/* Footer */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {up && <TrendingUpIcon sx={{ fontSize: 13, color: "#16a34a" }} />}
        {alert && <WarningAmberIcon sx={{ fontSize: 13, color: "#ef4444" }} />}
        {delta && (
          <Typography
            sx={{
              fontSize: 11,
              color: alert ? "#ef4444" : up ? "#16a34a" : "#9ca3af",
            }}
          >
            {delta}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;

  // ── Scoped params per role ──────────────────────────────────────────────────
  // Each role sees ONLY their own data — never the global totals.
  //
  // NETWORK : dealers & subdealers & customers scoped to their networkId
  // DEALER  : subdealers & customers scoped to their dealerId
  // SUBDEALER: customers scoped to their subDealerId
  // ADMIN   : sees everything (no filter)
  const customerParams =
    role === "NETWORK"
      ? { networkId: user?.id, page: 0, size: 5 }
      : role === "DEALER"
        ? { dealerId: user?.id, page: 0, size: 5 }
        : role === "SUBDEALER"
          ? { subDealerId: user?.id, page: 0, size: 5 }
          : { page: 0, size: 5 };

  const dealerParams =
    role === "NETWORK"
      ? { networkId: user?.id, page: 0, size: 1 }
      : { page: 0, size: 1 }; // ADMIN sees all; DEALER query disabled below

  const subDealerParams =
    role === "NETWORK"
      ? { networkId: user?.id, page: 0, size: 1 }
      : role === "DEALER"
        ? { dealerId: user?.id, page: 0, size: 1 }
        : { page: 0, size: 1 };

  const results = useQueries({
    queries: [
      // Customers — always scoped
      {
        queryKey: ["dashboard", "customers", role, user?.id],
        queryFn: () => customersApi.getAll(customerParams),
      },

      // Dealers — NETWORK sees only their own dealers; DEALER sees count=1 (themselves)
      {
        queryKey: ["dashboard", "dealers", role, user?.id],
        queryFn: () => dealersApi.getAll(dealerParams),
        enabled: ["ADMIN", "NETWORK"].includes(role),
      },

      // Networks — only ADMIN sees this card
      {
        queryKey: ["dashboard", "networks"],
        queryFn: () => networksApi.getAll({ page: 0, size: 1 }),
        enabled: role === "ADMIN",
      },

      // Pending tickets — always scoped server-side by the backend
      {
        queryKey: ["dashboard", "pendingTickets"],
        queryFn: () => ticketsApi.pendingCount(),
      },

      // Sub-dealers — scoped to their parent
      {
        queryKey: ["dashboard", "subdealers", role, user?.id],
        queryFn: () => subdealersApi.getAll(subDealerParams),
        enabled: ["ADMIN", "NETWORK", "DEALER"].includes(role),
      },
    ],
  });

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => api.get("/dashboard/summary"),
    staleTime: 5 * 60 * 1000,
    select: (res) => res.data,
  });

  const [custQ, dealerQ, networkQ, ticketQ, subDealerQ] = results;
  const isFirstLoad = results.some((q) => q.isLoading);

  const stats = {
    totalCustomers: custQ.data?.data?.totalElements ?? 0,
    totalDealers: dealerQ.data?.data?.totalElements ?? 0,
    totalNetworks: networkQ.data?.data?.totalElements ?? 0,
    pendingTickets: ticketQ.data?.data ?? 0,
    totalSubDealers: subDealerQ.data?.data?.totalElements ?? 0,
  };
  const customers = custQ.data?.data?.content ?? [];

  const commissionsByMonth = summaryData?.commissionsByMonth ?? [];
  const customersByStatus = summaryData?.customersByStatus;
  const pieData = customersByStatus
    ? [
        {
          name: "Ενεργοί",
          value: Number(customersByStatus.active),
          color: ACTIVE_COLOR,
        },
        {
          name: "Ανενεργοί",
          value: Number(customersByStatus.inactive),
          color: INACTIVE_COLOR,
        },
      ]
    : [];

  const hasCommissionsChart = ["ADMIN", "NETWORK", "DEALER"].includes(role);
  // ADMIN    → both series (dealer + network)
  // NETWORK  → only network series (they earn network commissions, not dealer)
  // DEALER   → only dealer series (their own commissions)
  const showDealerSeries = ["ADMIN", "DEALER"].includes(role);
  const showNetworkSeries = ["ADMIN", "NETWORK"].includes(role);
  const maxCommission = commissionsByMonth.reduce((m, r) => {
    const d = showDealerSeries ? Number(r.dealer) || 0 : 0;
    const n = showNetworkSeries ? Number(r.network) || 0 : 0;
    return Math.max(m, d, n);
  }, 0);

  // ── Stat card labels adapt to role ────────────────────────────────────────
  // NETWORK label: "Dealers μου" not "Ενεργοί Dealers" (global)
  // DEALER  label: "Sub-dealers μου"
  const dealerLabel = role === "ADMIN" ? "ΕΝΕΡΓΟΙ DEALERS" : "DEALERS ΜΟΥ";
  const subDealerLabel =
    role === "ADMIN"
      ? "SUB-DEALERS"
      : role === "NETWORK"
        ? "SUB-DEALERS ΔΙΚΤΥΟΥ"
        : "SUB-DEALERS ΜΟΥ";
  const customerLabel =
    role === "ADMIN"
      ? "ΣΥΝΟΛΟ ΠΕΛΑΤΩΝ"
      : role === "NETWORK"
        ? "ΠΕΛΑΤΕΣ ΔΙΚΤΥΟΥ"
        : role === "DEALER"
          ? "ΠΕΛΑΤΕΣ ΜΟΥ"
          : "ΟΙ ΠΕΛΑΤΕΣ ΜΟΥ";

  const allCards = [
    // Customers — all roles, label adapts
    {
      label: customerLabel,
      value: stats.totalCustomers.toLocaleString("el-GR"),
      icon: <PeopleIcon sx={{ fontSize: 18 }} />,
      color: "#3b82f6",
      up: true,
      path: "/customers",
      roles: ["ADMIN", "NETWORK", "DEALER", "SUBDEALER"],
    },

    // Dealers — ADMIN sees all, NETWORK sees their own; DEALER card hidden (they are a dealer)
    {
      label: dealerLabel,
      value: stats.totalDealers.toLocaleString("el-GR"),
      icon: <StoreIcon sx={{ fontSize: 18 }} />,
      color: "#22c55e",
      up: true,
      path: "/dealers",
      roles: ["ADMIN", "NETWORK"],
    },

    // Sub-dealers — ADMIN/NETWORK/DEALER, label adapts
    {
      label: subDealerLabel,
      value: stats.totalSubDealers.toLocaleString("el-GR"),
      icon: <PersonIcon sx={{ fontSize: 18 }} />,
      color: "#f59e0b",
      delta: "Σύνολο",
      path: "/subdealers",
      roles: ["ADMIN", "NETWORK", "DEALER"],
    },

    // Networks — ADMIN only; NETWORK user IS a network, so they don't need a count
    {
      label: "NETWORKS",
      value: stats.totalNetworks.toLocaleString("el-GR"),
      icon: <HubIcon sx={{ fontSize: 18 }} />,
      color: "#8b5cf6",
      delta: "Σύνολο",
      path: "/networks",
      roles: ["ADMIN"],
    },

    // Pending tickets — all roles, scoped server-side
    {
      label: "ΕΚΚΡΕΜΗ ΑΙΤΗΜΑΤΑ",
      value: stats.pendingTickets.toLocaleString("el-GR"),
      icon: <WarningAmberIcon sx={{ fontSize: 18 }} />,
      color: stats.pendingTickets > 0 ? "#ef4444" : "#22c55e",
      delta: stats.pendingTickets > 0 ? "Χρειάζεται προσοχή" : "Όλα εντάξει",
      alert: stats.pendingTickets > 0,
      path: "/requests",
      roles: ["ADMIN", "NETWORK", "DEALER", "SUBDEALER"],
    },
  ];
  const statCards = allCards.filter((c) => c.roles.includes(role));

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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {custQ.isError && (
        <Alert severity="error">Σφάλμα φόρτωσης δεδομένων</Alert>
      )}

      {/* ── Stat cards — horizontal strip ──────────────────────────────────── */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} onClick={() => navigate(s.path)} />
        ))}
      </Box>

      {/* ── Charts + summary — single wide card, two columns inside ──────── */}
      {(hasCommissionsChart || pieData.length > 0) && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "0.5px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", minHeight: 280 }}>
            {/* LEFT — area chart (fills available space) */}
            {hasCommissionsChart && (
              <Box sx={{ flex: 1, p: 2.5, minWidth: 0 }}>
                {/* Header */}
                <Box sx={{ mb: 0.5 }}>
                  <Typography
                    sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}
                  >
                    Προμήθειες — τελευταίοι 6 μήνες
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mt: 0.75 }}>
                    {showDealerSeries && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.6 }}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 2.5,
                            borderRadius: 2,
                            background: DEALER_COLOR,
                          }}
                        />
                        <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
                          Dealer
                        </Typography>
                      </Box>
                    )}
                    {showNetworkSeries && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.6 }}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 2.5,
                            borderRadius: 2,
                            background: NETWORK_COLOR,
                          }}
                        />
                        <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
                          Network
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {summaryLoading ? (
                  <ChartSkeleton height={190} />
                ) : maxCommission === 0 ? (
                  <Box
                    sx={{
                      height: 190,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TrendingUpIcon sx={{ fontSize: 22, color: "#d1d5db" }} />
                    </Box>
                    <Typography
                      sx={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}
                    >
                      Δεν υπάρχουν προμήθειες ακόμα
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "#d1d5db",
                        textAlign: "center",
                        maxWidth: 240,
                      }}
                    >
                      Τα δεδομένα θα εμφανιστούν όταν καταχωρηθούν πληρωμές
                    </Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={190}>
                    <AreaChart
                      data={commissionsByMonth}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="gradDealer"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={DEALER_COLOR}
                            stopOpacity={0.12}
                          />
                          <stop
                            offset="95%"
                            stopColor={DEALER_COLOR}
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="gradNetwork"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={NETWORK_COLOR}
                            stopOpacity={0.12}
                          />
                          <stop
                            offset="95%"
                            stopColor={NETWORK_COLOR}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f3f4f6"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) =>
                          `€${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                        }
                        domain={[
                          0,
                          maxCommission > 0
                            ? Math.ceil(maxCommission * 1.2)
                            : 100,
                        ]}
                      />
                      <RTooltip
                        content={<CommissionTooltip />}
                        cursor={{ stroke: "#e5e7eb" }}
                      />
                      {showDealerSeries && (
                        <Area
                          type="monotone"
                          dataKey="dealer"
                          name="Dealer"
                          stroke={DEALER_COLOR}
                          strokeWidth={2}
                          fill="url(#gradDealer)"
                          dot={{ r: 3, fill: DEALER_COLOR, strokeWidth: 0 }}
                          activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                      )}
                      {showNetworkSeries && (
                        <Area
                          type="monotone"
                          dataKey="network"
                          name="Network"
                          stroke={NETWORK_COLOR}
                          strokeWidth={2}
                          fill="url(#gradNetwork)"
                          dot={{ r: 3, fill: NETWORK_COLOR, strokeWidth: 0 }}
                          activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Box>
            )}

            {/* Divider between the two halves */}
            {hasCommissionsChart && pieData.length > 0 && (
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: "#f3f4f6" }}
              />
            )}

            {/* RIGHT — pie chart + numbers (fixed width) */}
            {pieData.length > 0 && (
              <Box
                sx={{
                  width: 220,
                  flexShrink: 0,
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#111827",
                    mb: 1.5,
                  }}
                >
                  Κατάσταση πελατών
                </Typography>

                {summaryLoading ? (
                  <ChartSkeleton height={140} />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={130}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {pieData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <RTooltip
                          formatter={(val) => [val.toLocaleString("el-GR"), ""]}
                          contentStyle={{
                            fontSize: 12,
                            borderRadius: 8,
                            border: "0.5px solid #e5e7eb",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Stat numbers */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      {pieData.map((p) => (
                        <Box
                          key={p.name}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.8,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: p.color,
                                flexShrink: 0,
                              }}
                            />
                            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                              {p.name}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#111827",
                              fontFamily: "monospace",
                            }}
                          >
                            {p.value.toLocaleString("el-GR")}
                          </Typography>
                        </Box>
                      ))}
                      <Divider sx={{ borderColor: "#f3f4f6", my: 0.5 }} />
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
                          Σύνολο
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#111827",
                            fontFamily: "monospace",
                          }}
                        >
                          {pieData
                            .reduce((s, p) => s + p.value, 0)
                            .toLocaleString("el-GR")}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* ── Recent customers ───────────────────────────────────────────────── */}
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
          <Box
            onClick={() => navigate("/customers")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.4,
              cursor: "pointer",
              color: "#3b82f6",
              "&:hover": { opacity: 0.75 },
            }}
          >
            <Typography sx={{ fontSize: 12 }}>Προβολή όλων</Typography>
            <ArrowForwardIcon sx={{ fontSize: 13 }} />
          </Box>
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
                      whiteSpace: "nowrap",
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
                      padding: "48px 16px",
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
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fafafa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 12,
                        fontFamily: "monospace",
                        color: "#6b7280",
                      }}
                    >
                      {c.afm}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#111827",
                      }}
                    >
                      {c.eponymia}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 13,
                        color: "#6b7280",
                      }}
                    >
                      {c.city || "—"}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 13,
                        color: "#6b7280",
                      }}
                    >
                      {c.dealerName || "—"}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
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
