import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { commissionsApi } from "../../services/commissions";

// The 8 products — must match backend Product IDs 1-8
const PRODUCTS = [
  { id: 1, description: "Συνδρομή εφαρμογής" },
  { id: 2, description: "Ενεργός Πάροχος ΗΤ" },
  { id: 3, description: "Σύνδεση POS" },
  { id: 4, description: "Άδεια mobile App" },
  { id: 5, description: "Σύνδεση WooCommerce" },
  { id: 6, description: "Ενεργά SMS" },
  { id: 7, description: "Ενεργά email" },
  { id: 8, description: "Ψηφιακό Πελατολόγιο" },
];

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL CATALOG DESIGN
//
// Per spec, the admin sets ONE global catalog for Network and ONE for Dealer.
// These are stored in the `commissions` table using a reserved sentinel
// entityId: "00000000" (the admin's own ID, which is always "00000001"...
// but we use a dedicated sentinel so it never clashes with a real entity).
//
// Sentinel IDs:
//   NETWORK_DEFAULT_ID = "00000010"  → global defaults for all Networks
//   DEALER_DEFAULT_ID  = "00000020"  → global defaults for all Dealers
//
// When a new Network or Dealer is created, their commission rows are
// pre-populated by copying from these defaults (done in backend service).
// The admin can still override commissions per individual entity afterwards.
// ─────────────────────────────────────────────────────────────────────────────
const NETWORK_DEFAULT_ID = "00000010";
const DEALER_DEFAULT_ID = "00000020";

const emptyRows = () =>
  PRODUCTS.map((p) => ({
    productId: p.id,
    description: p.description,
    percentage: "",
    salePrice: "",
  }));

// ─── Reusable table component ─────────────────────────────────────────────────
function PriceTable({ title, color, data, onChange, onSave, saving, loading }) {
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
  const tdStyle = {
    padding: "10px 16px",
    borderBottom: "0.5px solid #f3f4f6",
    fontSize: 13,
    color: "#374151",
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: color + "10",
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
          {title}
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={
            saving ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          disabled={saving || loading}
          onClick={onSave}
          sx={{
            background: color,
            "&:hover": { background: color, filter: "brightness(0.9)" },
            fontWeight: 600,
          }}
        >
          {saving ? "Αποθήκευση..." : "Αποθήκευση"}
        </Button>
      </Box>

      {/* Table */}
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
                <th style={{ ...thStyle, width: 160 }}>Προμήθεια %</th>
                <th style={{ ...thStyle, width: 160 }}>Τιμή Πώλησης (€)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.productId}>
                  <td style={tdStyle}>{row.description}</td>
                  <td style={tdStyle}>
                    <TextField
                      size="small"
                      type="number"
                      value={row.percentage}
                      onChange={(e) =>
                        onChange(i, "percentage", e.target.value)
                      }
                      inputProps={{
                        min: 0,
                        max: 100,
                        step: 0.1,
                        style: {
                          width: 90,
                          fontFamily: "monospace",
                          padding: "6px 8px",
                        },
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <TextField
                      size="small"
                      type="number"
                      value={row.salePrice}
                      onChange={(e) => onChange(i, "salePrice", e.target.value)}
                      inputProps={{
                        min: 0,
                        step: 0.01,
                        style: {
                          width: 90,
                          fontFamily: "monospace",
                          padding: "6px 8px",
                        },
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                    />
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
export default function PricelistPage() {
  const [loadingNetwork, setLoadingNetwork] = useState(true);
  const [loadingDealer, setLoadingDealer] = useState(true);
  const [error, setError] = useState("");
  const [savingNetwork, setSavingNetwork] = useState(false);
  const [savingDealer, setSavingDealer] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [networkData, setNetworkData] = useState(emptyRows());
  const [dealerData, setDealerData] = useState(emptyRows());

  // ── Load global catalog on mount ───────────────────────────────────────────
  useEffect(() => {
    // Load Network global catalog
    commissionsApi
      .getByEntity("NETWORK", NETWORK_DEFAULT_ID)
      .then((res) => {
        const apiRows = res.data.commissions ?? [];
        setNetworkData(
          PRODUCTS.map((p) => {
            const found = apiRows.find((c) => c.productId === p.id);
            return {
              productId: p.id,
              description: p.description,
              percentage:
                found?.percentage != null ? String(found.percentage) : "",
              salePrice:
                found?.salePrice != null ? String(found.salePrice) : "",
            };
          }),
        );
      })
      .catch(() => setError("Σφάλμα φόρτωσης τιμοκαταλόγου Network"))
      .finally(() => setLoadingNetwork(false));

    // Load Dealer global catalog
    commissionsApi
      .getByEntity("DEALER", DEALER_DEFAULT_ID)
      .then((res) => {
        const apiRows = res.data.commissions ?? [];
        setDealerData(
          PRODUCTS.map((p) => {
            const found = apiRows.find((c) => c.productId === p.id);
            return {
              productId: p.id,
              description: p.description,
              percentage:
                found?.percentage != null ? String(found.percentage) : "",
              salePrice:
                found?.salePrice != null ? String(found.salePrice) : "",
            };
          }),
        );
      })
      .catch(() => setError("Σφάλμα φόρτωσης τιμοκαταλόγου Dealer"))
      .finally(() => setLoadingDealer(false));
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleNetworkChange = (i, field, value) => {
    setNetworkData((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    );
  };

  const handleDealerChange = (i, field, value) => {
    setDealerData((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    );
  };

  // ── Save Network global catalog ────────────────────────────────────────────
  const saveNetwork = async () => {
    setSavingNetwork(true);
    setError("");
    try {
      await commissionsApi.save({
        entityType: "NETWORK",
        entityId: NETWORK_DEFAULT_ID,
        commissions: networkData.map((r) => ({
          productId: r.productId,
          percentage: r.percentage !== "" ? Number(r.percentage) : 0,
          salePrice: r.salePrice !== "" ? Number(r.salePrice) : null,
        })),
      });
      showSuccess("Τιμοκατάλογος Network αποθηκεύτηκε επιτυχώς!");
    } catch {
      setError("Σφάλμα αποθήκευσης τιμοκαταλόγου Network");
    } finally {
      setSavingNetwork(false);
    }
  };

  // ── Save Dealer global catalog ─────────────────────────────────────────────
  const saveDealer = async () => {
    setSavingDealer(true);
    setError("");
    try {
      await commissionsApi.save({
        entityType: "DEALER",
        entityId: DEALER_DEFAULT_ID,
        commissions: dealerData.map((r) => ({
          productId: r.productId,
          percentage: r.percentage !== "" ? Number(r.percentage) : 0,
          salePrice: r.salePrice !== "" ? Number(r.salePrice) : null,
        })),
      });
      showSuccess("Τιμοκατάλογος Dealer αποθηκεύτηκε επιτυχώς!");
    } catch {
      setError("Σφάλμα αποθήκευσης τιμοκαταλόγου Dealer");
    } finally {
      setSavingDealer(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
          Τιμοκατάλογος
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
          Ορισμός προεπιλεγμένων προμηθειών και τιμών πώλησης. Αυτές οι τιμές
          χρησιμοποιούνται ως βάση για κάθε νέο Network ή Dealer που
          δημιουργείται.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}

      <PriceTable
        title="Τιμοκατάλογος για Network"
        color="#6d28d9"
        data={networkData}
        onChange={handleNetworkChange}
        onSave={saveNetwork}
        saving={savingNetwork}
        loading={loadingNetwork}
      />

      <PriceTable
        title="Τιμοκατάλογος για Dealer"
        color="#1d4ed8"
        data={dealerData}
        onChange={handleDealerChange}
        onSave={saveDealer}
        saving={savingDealer}
        loading={loadingDealer}
      />
    </Box>
  );
}
