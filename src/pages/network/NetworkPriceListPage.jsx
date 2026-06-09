import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { commissionsApi } from "../../services/commissions";
import { useAuth } from "../../context/AuthContext";

// Global sentinel IDs — same ones the Admin PricelistPage writes to
const NETWORK_DEFAULT_ID = "00000010";
const DEALER_DEFAULT_ID = "00000020";

const PRODUCTS = [
  { id: 1, description: "Συνδρομή εφαρμογής", defaultPrice: 120 },
  { id: 2, description: "Ενεργός Πάροχος ΗΤ", defaultPrice: 100 },
  { id: 3, description: "Σύνδεση POS", defaultPrice: 50 },
  { id: 4, description: "Άδεια mobile App", defaultPrice: 100 },
  { id: 5, description: "Σύνδεση WooCommerce", defaultPrice: 200 },
  { id: 6, description: "Ενεργά SMS", defaultPrice: 30 },
  { id: 7, description: "Ενεργά email", defaultPrice: 20 },
  { id: 8, description: "Ψηφιακό Πελατολόγιο", defaultPrice: 50 },
];

// Merge API rows with full PRODUCTS list — every row always appears.
// If the API has no data for a product, percentage and salePrice are null (shows "—").
function mergeWithProducts(apiRows) {
  return PRODUCTS.map((p) => {
    const found = (apiRows ?? []).find((c) => c.productId === p.id);
    return {
      productId: p.id,
      productDescription: p.description,
      defaultPrice: p.defaultPrice,
      percentage: found?.percentage ?? null,
      salePrice: found?.salePrice ?? null,
    };
  });
}

// ─── Read-only table ──────────────────────────────────────────────────────────
function ReadOnlyTable({ title, color, data, loading }) {
  const thStyle = {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: 11,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 500,
    borderBottom: "0.5px solid #e5e7eb",
    background: "#fafafa",
    whiteSpace: "nowrap",
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: "0.5px solid #e5e7eb",
        overflow: "hidden",
        mb: 3,
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          px: 2.5,
          py: 1.8,
          borderBottom: "0.5px solid #e5e7eb",
          background: color + "10",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <LockIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
          <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
            Μόνο προβολή
          </Typography>
        </Box>
      </Box>

      {/* Body */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Περιγραφή</th>
                <th style={{ ...thStyle, width: 180 }}>Προμήθεια %</th>
                <th style={{ ...thStyle, width: 180, textAlign: "right" }}>
                  Τιμή Πώλησης
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={row.productId}
                  style={{
                    borderBottom:
                      i < data.length - 1 ? "0.5px solid #f3f4f6" : "none",
                  }}
                >
                  {/* Description */}
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "#374151",
                    }}
                  >
                    {row.productDescription}
                  </td>

                  {/* Percentage */}
                  <td style={{ padding: "12px 16px" }}>
                    {row.percentage != null ? (
                      <Chip
                        label={`${Number(row.percentage).toFixed(1)}%`}
                        size="small"
                        sx={{
                          fontSize: 12,
                          height: 24,
                          background: color + "20",
                          color: color,
                          fontFamily: "monospace",
                          fontWeight: 700,
                        }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: 12, color: "#d1d5db" }}>
                        —
                      </Typography>
                    )}
                  </td>

                  {/* Sale price */}
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {row.salePrice != null ? (
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#111827",
                            fontFamily: "monospace",
                          }}
                        >
                          €{Number(row.salePrice).toFixed(2)}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>
                          από €{row.defaultPrice} τιμοκαταλόγου
                        </Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: 13, color: "#d1d5db" }}>
                        —
                      </Typography>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}
    </Paper>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NetworkPricelistPage() {
  const { user } = useAuth();

  const [networkData, setNetworkData] = useState([]);
  const [dealerData, setDealerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        // Run both requests in parallel
        const [netRes, dealerRes] = await Promise.all([
          // Network table: this network's OWN commission rows
          commissionsApi.getByEntity("NETWORK", user.id),
          // Dealer table: the GLOBAL dealer defaults set by Admin in Τιμοκατάλογος
          commissionsApi.getByEntity("DEALER", DEALER_DEFAULT_ID),
        ]);

        setNetworkData(mergeWithProducts(netRes.data.commissions));
        setDealerData(mergeWithProducts(dealerRes.data.commissions));
      } catch {
        setError("Σφάλμα φόρτωσης τιμοκαταλόγου");
        // On error show empty rows — no mock data
        const empty = mergeWithProducts([]);
        setNetworkData(empty);
        setDealerData(empty);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
          Τιμοκατάλογος
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
          Προβολή προμηθειών — ορίζονται από τον Admin · Μόνο ανάγνωση
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <ReadOnlyTable
        title="Τιμοκατάλογος για Network"
        color="#6d28d9"
        data={networkData}
        loading={loading}
      />

      <ReadOnlyTable
        title="Τιμοκατάλογος για Dealer"
        color="#1d4ed8"
        data={dealerData}
        loading={loading}
      />
    </Box>
  );
}
