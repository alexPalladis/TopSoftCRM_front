import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Divider,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import StoreIcon from "@mui/icons-material/Store";
import { dealersApi } from "../../services/dealers";
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

function DetailRow({ label, value, mono = false }) {
  return (
    <Box sx={{ display: "flex", py: 0.9, borderBottom: "0.5px solid #f3f4f6" }}>
      <Typography
        sx={{ fontSize: 12, color: "#9ca3af", width: 180, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 13,
          color: "#111827",
          fontFamily: mono ? "monospace" : "inherit",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

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

export default function DealerSelfPage() {
  const { user } = useAuth();

  const [dealer, setDealer] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [dealerRes, commRes] = await Promise.all([
          dealersApi.getById(user.id),
          commissionsApi.getByEntity("DEALER", user.id),
        ]);

        setDealer(dealerRes.data);

        const apiRows = commRes.data.commissions ?? [];
        setCommissions(
          PRODUCTS.map((p) => {
            const found = apiRows.find((c) => c.productId === p.id);
            return {
              productId: p.id,
              description: p.description,
              defaultPrice: p.defaultPrice,
              percentage: found?.percentage ?? null,
              salePrice: found?.salePrice ?? null,
            };
          }),
        );
      } catch {
        setError("Σφάλμα φόρτωσης στοιχείων");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!dealer) return null;

  return (
    <Box sx={{ maxWidth: 900 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            background: "#dbeafe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StoreIcon sx={{ color: "#1d4ed8", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
            {dealer.eponymia}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{ fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}
            >
              ID: {dealer.id}
            </Typography>
            <Chip
              icon={<LockIcon sx={{ fontSize: 12 }} />}
              label="Μόνο προβολή"
              size="small"
              sx={{ background: "#dbeafe", color: "#1e40af", fontSize: 11 }}
            />
            <Chip
              label={dealer.active ? "Ενεργός" : "Ανενεργός"}
              size="small"
              sx={{
                background: dealer.active ? "#dcfce7" : "#f3f4f6",
                color: dealer.active ? "#166534" : "#6b7280",
                fontSize: 11,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Στοιχεία επιχείρησης */}
      <Paper
        elevation={0}
        sx={{ p: 3, borderRadius: 2, border: "0.5px solid #e5e7eb", mb: 3 }}
      >
        <Typography
          sx={{
            fontSize: 11,
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            mb: 2,
          }}
        >
          Στοιχεία επιχείρησης
        </Typography>
        <Grid container spacing={0}>
          <Grid item xs={12} md={6}>
            <DetailRow label="ID" value={dealer.id} mono />
            <DetailRow label="ΑΦΜ" value={dealer.afm} mono />
            <DetailRow label="Επωνυμία" value={dealer.eponymia} />
            <DetailRow
              label="Νόμιμος εκπρόσωπος"
              value={dealer.nomimosEkprosopos}
            />
            <DetailRow label="Επάγγελμα" value={dealer.epaggelma} />
            <DetailRow label="Δ.Ο.Υ." value={dealer.doy} />
          </Grid>
          <Grid item xs={12} md={6}>
            <DetailRow label="Διεύθυνση" value={dealer.address} />
            <DetailRow label="Πόλη" value={dealer.city} />
            <DetailRow label="Τ.Κ." value={dealer.tk} />
            <DetailRow label="Τηλέφωνο σταθερό" value={dealer.phoneFixed} />
            <DetailRow label="Τηλέφωνο κινητό" value={dealer.phoneMobile} />
            <DetailRow label="Email" value={dealer.email} />
          </Grid>
        </Grid>
        {dealer.networkName && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <DetailRow label="Network" value={dealer.networkName} />
          </>
        )}
      </Paper>

      {/* Τιμοκατάλογος — read-only */}
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
            background: "#1d4ed808",
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
            Τιμοκατάλογος
          </Typography>
        </Box>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Περιγραφή</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Προμήθεια %</th>
                <th style={{ ...thStyle, textAlign: "center" }}>
                  Τιμή Πώλησης €
                </th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((row, i) => (
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
                          background: "#dbeafe",
                          color: "#1e40af",
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
                        €{row.defaultPrice}
                      </Typography>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
}
