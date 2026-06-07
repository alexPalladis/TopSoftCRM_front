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

const SUBDEALER_COLOR = "#f59e0b";

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

export default function SubDealerPricelistPage() {
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await commissionsApi.getByEntity("SUBDEALER", user.id);
        const apiRows = res.data.commissions ?? [];

        const merged = PRODUCTS.map((p) => {
          const found = apiRows.find((c) => c.productId === p.id);
          return {
            productId: p.id,
            description: p.description,
            defaultPrice: p.defaultPrice,
            percentage: found?.percentage ?? null,
            salePrice: found?.salePrice ?? null,
          };
        });
        setRows(merged);
      } catch {
        setError("Σφάλμα φόρτωσης τιμοκαταλόγου");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
          Τιμοκατάλογος
        </Typography>
        <Chip
          icon={<LockIcon sx={{ fontSize: 14 }} />}
          label="Μόνο προβολή"
          size="small"
          sx={{ background: "#fef3c7", color: "#b45309", fontSize: 11 }}
        />
      </Box>

      <Typography sx={{ fontSize: 13, color: "#6b7280", mb: 3 }}>
        Οι τιμές πώλησης και τα ποσοστά προμήθειάς σας όπως έχουν οριστεί από
        τον Dealer σας.
      </Typography>

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
        <Box
          sx={{
            px: 2.5,
            py: 1.8,
            borderBottom: "0.5px solid #e5e7eb",
            background: SUBDEALER_COLOR + "10",
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
            Τιμοκατάλογος SubDealer
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Περιγραφή</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>
                    Προμήθεια %
                  </th>
                  <th style={{ ...thStyle, textAlign: "center" }}>
                    Τιμή Πώλησης €
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.productId}
                    style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}
                  >
                    <td
                      style={{
                        padding: "10px 16px",
                        fontSize: 12,
                        color: "#9ca3af",
                        width: 36,
                      }}
                    >
                      {i + 1}
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        fontSize: 13,
                        color: "#374151",
                      }}
                    >
                      {row.description}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      {row.percentage != null ? (
                        <Chip
                          label={`${row.percentage}%`}
                          size="small"
                          sx={{
                            background: "#fef3c7",
                            color: "#92400e",
                            fontWeight: 600,
                            fontSize: 12,
                          }}
                        />
                      ) : (
                        <Typography sx={{ fontSize: 13, color: "#d1d5db" }}>
                          —
                        </Typography>
                      )}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      {row.salePrice != null ? (
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#111827",
                            fontFamily: "monospace",
                          }}
                        >
                          €{Number(row.salePrice).toFixed(2)}
                        </Typography>
                      ) : (
                        <Typography sx={{ fontSize: 13, color: "#d1d5db" }}>
                          από τιμοκατάλογο: €{row.defaultPrice}
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
