import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { commissionsApi } from "../../services/commissions";
import { useAuth } from "../../context/AuthContext";

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
      {/* Header */}
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

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Περιγραφή</th>
                <th style={{ ...thStyle, width: 220 }}>
                  Προμήθεια επί τελικής τιμής %
                </th>
                <th style={{ ...thStyle, width: 180, textAlign: "right" }}>
                  Τιμή Πώλησης
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={row.productId || i}
                  style={{ borderBottom: "0.5px solid #f3f4f6" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "#9ca3af",
                      fontFamily: "monospace",
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "#111827",
                      fontWeight: 500,
                    }}
                  >
                    {row.productDescription}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {Number(row.percentage) > 0 ? (
                      <Chip
                        label={`${Number(row.percentage).toFixed(0)}%`}
                        size="small"
                        sx={{
                          fontSize: 12,
                          height: 24,
                          background: color + "20",
                          color,
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
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {row.salePrice ? (
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
                          από €{PRODUCTS[i]?.defaultPrice || "—"} τιμοκαταλόγου
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

      <Box
        sx={{
          px: 2.5,
          py: 1.2,
          background: "#fafafa",
          borderTop: "0.5px solid #e5e7eb",
        }}
      >
        <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
          Ορίζεται από τον Admin · Δεν επιτρέπεται τροποποίηση
        </Typography>
      </Box>
    </Paper>
  );
}

export default function NetworkPricelistPage() {
  const { user } = useAuth();

  const [networkData, setNetworkData] = useState([]);
  const [dealerData, setDealerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        // Φόρτωσε προμήθειες του network (για τον εαυτό του)
        const netRes = await commissionsApi.getByEntity("NETWORK", user?.id);

        // Κατασκεύασε τα δεδομένα για τον πίνακα Network
        const networkRows = (netRes.data.commissions || []).map((c) => ({
          productId: c.productId,
          productDescription: c.productDescription,
          percentage: c.percentage,
          salePrice: c.salePrice,
        }));

        // Αν δεν επέστρεψε δεδομένα, γέμισε με mock
        setNetworkData(
          networkRows.length > 0
            ? networkRows
            : PRODUCTS.map((p, i) => ({
                productId: p.id,
                productDescription: p.description,
                percentage: [5, 4, 4, 3, 3, 2, 2, 3][i],
                salePrice: (
                  p.defaultPrice *
                  (1 - [5, 4, 4, 3, 3, 2, 2, 3][i] / 100)
                ).toFixed(2),
              })),
        );

        // Για τον πίνακα Dealer — γενικές τιμές (default από τιμοκατάλογο)
        setDealerData(
          PRODUCTS.map((p, i) => ({
            productId: p.id,
            productDescription: p.description,
            percentage: [15, 10, 12, 10, 8, 5, 5, 10][i],
            salePrice: (
              p.defaultPrice *
              (1 - [15, 10, 12, 10, 8, 5, 5, 10][i] / 100)
            ).toFixed(2),
          })),
        );
      } catch {
        // Fallback σε mock αν το API δεν έχει δεδομένα ακόμα
        setNetworkData(
          PRODUCTS.map((p, i) => ({
            productId: p.id,
            productDescription: p.description,
            percentage: [5, 4, 4, 3, 3, 2, 2, 3][i],
            salePrice: (
              p.defaultPrice *
              (1 - [5, 4, 4, 3, 3, 2, 2, 3][i] / 100)
            ).toFixed(2),
          })),
        );
        setDealerData(
          PRODUCTS.map((p, i) => ({
            productId: p.id,
            productDescription: p.description,
            percentage: [15, 10, 12, 10, 8, 5, 5, 10][i],
            salePrice: (
              p.defaultPrice *
              (1 - [15, 10, 12, 10, 8, 5, 5, 10][i] / 100)
            ).toFixed(2),
          })),
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchAll();
  }, [user]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
          Τιμοκατάλογος
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
          Προβολή προμηθειών του δικτύου σας — ορίζονται από τον Admin
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
