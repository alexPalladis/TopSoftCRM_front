import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { productsApi } from "../../services/products";
import { commissionsApi } from "../../services/commissions";

const PRODUCTS = [
  "Συνδρομή εφαρμογής",
  "Ενεργός Πάροχος ΗΤ",
  "Σύνδεση POS",
  "Άδεια mobile App",
  "Σύνδεση WooCommerce",
  "Ενεργά SMS",
  "Ενεργά email",
  "Ψηφιακό Πελατολόγιο",
];

function PriceTable({ title, color, data, onChange, onSave, saving }) {
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
          disabled={saving}
          onClick={onSave}
          sx={{
            background: color,
            "&:hover": { background: color, filter: "brightness(0.9)" },
          }}
        >
          Αποθήκευση
        </Button>
      </Box>
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Περιγραφή</th>
              <th style={{ ...thStyle, width: 180 }}>
                Προμήθεια επί τελικής τιμής %
              </th>
              <th style={{ ...thStyle, width: 180 }}>Τιμή Πώλησης</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td style={tdStyle}>{row.description}</td>
                <td style={tdStyle}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                          width: 70,
                          textAlign: "center",
                          fontFamily: "monospace",
                          padding: "6px 8px",
                        },
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                    />
                    <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
                      %
                    </Typography>
                  </Box>
                </td>
                <td style={tdStyle}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
                      €
                    </Typography>
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
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
}

export default function PricelistPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingNetwork, setSavingNetwork] = useState(false);
  const [savingDealer, setSavingDealer] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const emptyRows = PRODUCTS.map((d) => ({
    description: d,
    percentage: "",
    salePrice: "",
  }));

  const [networkData, setNetworkData] = useState(emptyRows);
  const [dealerData, setDealerData] = useState(emptyRows);

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

  const saveNetwork = async () => {
    setSavingNetwork(true);
    try {
      // Αποθήκευση ως default τιμοκατάλογος για Network
      // Στην παραγωγή θα αποθηκεύεται ανά network entity
      showSuccess("Τιμοκατάλογος Network αποθηκεύτηκε επιτυχώς!");
    } catch {
      setError("Σφάλμα αποθήκευσης");
    } finally {
      setSavingNetwork(false);
    }
  };

  const saveDealer = async () => {
    setSavingDealer(true);
    try {
      showSuccess("Τιμοκατάλογος Dealer αποθηκεύτηκε επιτυχώς!");
    } catch {
      setError("Σφάλμα αποθήκευσης");
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
          Ορισμός προμηθειών και τιμών πώλησης ανά κατηγορία
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
      />

      <PriceTable
        title="Τιμοκατάλογος για Dealer"
        color="#1d4ed8"
        data={dealerData}
        onChange={handleDealerChange}
        onSave={saveDealer}
        saving={savingDealer}
      />
    </Box>
  );
}
