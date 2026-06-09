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

// Dealer role color — blue
const DEALER_COLOR = "#1d4ed8";

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

export default function DealerPricelistPage() {
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const fetch = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch this dealer's own commissions from the API.
        // The backend returns the percentages and sale prices that
        // were set for this specific dealer by the Admin / Network.
        const res = await commissionsApi.getByEntity("DEALER", user.id);
        const apiRows = res.data.commissions ?? [];

        // Merge API data with the full PRODUCTS list.
        // Every product always appears in the table — if the API hasn't
        // set a commission for a product yet, percentage and salePrice show as "—".
        const merged = PRODUCTS.map((p) => {
          const found = apiRows.find((c) => c.productId === p.id);
          return {
            productId: p.id,
            productDescription: p.description,
            defaultPrice: p.defaultPrice,
            percentage: found?.percentage ?? null,
            salePrice: found?.salePrice ?? null,
          };
        });

        setRows(merged);
      } catch {
        setError("Σφάλμα φόρτωσης τιμοκαταλόγου");
        // Fallback — show empty rows so the table still renders cleanly
        setRows(
          PRODUCTS.map((p) => ({
            productId: p.id,
            productDescription: p.description,
            defaultPrice: p.defaultPrice,
            percentage: null,
            salePrice: null,
          })),
        );
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user]);

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
          Τιμοκατάλογος
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
          Προβολή προμηθειών σας — ορίζονται από τον Admin ή το Network σας
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "0.5px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {/* Table header bar */}
        <Box
          sx={{
            px: 2.5,
            py: 1.8,
            borderBottom: "0.5px solid #e5e7eb",
            background: DEALER_COLOR + "10",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
            Τιμοκατάλογος για Dealer
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <LockIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
            <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
              Μόνο προβολή
            </Typography>
          </Box>
        </Box>

        {/* Table */}
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
                {rows.map((row, i) => (
                  <tr
                    key={row.productId}
                    style={{ borderBottom: "0.5px solid #f3f4f6" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* # */}
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

                    {/* Description */}
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

                    {/* Commission % */}
                    <td style={{ padding: "12px 16px" }}>
                      {row.percentage != null && Number(row.percentage) > 0 ? (
                        <Chip
                          label={`${Number(row.percentage).toFixed(0)}%`}
                          size="small"
                          sx={{
                            fontSize: 12,
                            height: 24,
                            background: DEALER_COLOR + "20",
                            color: DEALER_COLOR,
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
    </Box>
  );
}
