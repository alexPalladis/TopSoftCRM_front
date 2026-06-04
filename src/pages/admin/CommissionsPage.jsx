import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Stack,
  CircularProgress,
  Alert,
  Checkbox,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { dealersApi } from "../../services/dealers";
import { networksApi } from "../../services/networks";

// Mock data — θα έρθει από API τιμολογιέρας
const mockCommissions = [
  {
    id: 1,
    date: "2026-06-01",
    product: "Συνδρομή εφαρμογής",
    customer: "Παπαδόπουλος Α.Ε.",
    afm: "123456789",
    amount: 120,
    dealerCommission: 18,
    networkCommission: 6,
    paidDealer: false,
    paidNetwork: false,
    receipt: "",
  },
  {
    id: 2,
    date: "2026-06-02",
    product: "Σύνδεση POS",
    customer: "Γεωργίου Ο.Ε.",
    afm: "987654321",
    amount: 50,
    dealerCommission: 6,
    networkCommission: 2.5,
    paidDealer: true,
    paidNetwork: true,
    receipt: "ΤΔΑ-001",
  },
  {
    id: 3,
    date: "2026-06-03",
    product: "Άδεια mobile App",
    customer: "Κωνσταντίνου Μ.",
    afm: "456789123",
    amount: 100,
    dealerCommission: 10,
    networkCommission: 0,
    paidDealer: false,
    paidNetwork: false,
    receipt: "",
  },
  {
    id: 4,
    date: "2026-06-03",
    product: "Ενεργά SMS",
    customer: "Δημητρίου Ε.Π.Ε.",
    afm: "321654987",
    amount: 30,
    dealerCommission: 1.5,
    networkCommission: 0.9,
    paidDealer: true,
    paidNetwork: false,
    receipt: "ΤΔΑ-002",
  },
  {
    id: 5,
    date: "2026-06-04",
    product: "Συνδρομή εφαρμογής",
    customer: "Αντωνίου & ΣΙΑ",
    afm: "654321789",
    amount: 120,
    dealerCommission: 18,
    networkCommission: 7.2,
    paidDealer: false,
    paidNetwork: false,
    receipt: "",
  },
];

const products = [
  "Συνδρομή εφαρμογής",
  "Ενεργός Πάροχος ΗΤ",
  "Σύνδεση POS",
  "Άδεια mobile App",
  "Σύνδεση WooCommerce",
  "Ενεργά SMS",
  "Ενεργά email",
  "Ψηφιακό Πελατολόγιο",
];

export default function CommissionsPage() {
  const [rows, setRows] = useState(mockCommissions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterNetwork, setFilterNetwork] = useState("");
  const [filterDealer, setFilterDealer] = useState("");
  const [networks, setNetworks] = useState([]);
  const [dealers, setDealers] = useState([]);

  useEffect(() => {
    networksApi
      .getAll({ size: 100 })
      .then((r) => setNetworks(r.data.content))
      .catch(() => {});
    dealersApi
      .getAll({ size: 100 })
      .then((r) => setDealers(r.data.content))
      .catch(() => {});
  }, []);

  const filtered = rows.filter((r) => {
    const matchFrom = !filterDateFrom || r.date >= filterDateFrom;
    const matchTo = !filterDateTo || r.date <= filterDateTo;
    const matchProduct = !filterProduct || r.product === filterProduct;
    return matchFrom && matchTo && matchProduct;
  });

  const totalDealerCommission = filtered.reduce(
    (s, r) => s + r.dealerCommission,
    0,
  );
  const totalNetworkCommission = filtered.reduce(
    (s, r) => s + r.networkCommission,
    0,
  );
  const totalAmount = filtered.reduce((s, r) => s + r.amount, 0);

  const togglePaidDealer = (id) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, paidDealer: !r.paidDealer } : r)),
    );
  const togglePaidNetwork = (id) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, paidNetwork: !r.paidNetwork } : r,
      ),
    );
  const updateReceipt = (id, val) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, receipt: val } : r)),
    );
  const handleDelete = (id) => {
    if (window.confirm("Διαγραφή εγγραφής;"))
      setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const exportExcel = () => {
    const header = [
      "Ημερομηνία",
      "Προϊόν",
      "Πελάτης",
      "ΑΦΜ",
      "Ποσό",
      "Προμήθεια Dealer",
      "Προμήθεια Network",
      "Πληρώθηκε Dealer",
      "Πληρώθηκε Network",
      "Παραστατικό",
    ];
    const csvRows = [
      header.join(","),
      ...filtered.map((r) =>
        [
          r.date,
          r.product,
          r.customer,
          r.afm,
          r.amount,
          r.dealerCommission,
          r.networkCommission,
          r.paidDealer ? "Ναι" : "Όχι",
          r.paidNetwork ? "Ναι" : "Όχι",
          r.receipt,
        ].join(","),
      ),
    ];
    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "promithies.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterProduct("");
    setFilterNetwork("");
    setFilterDealer("");
  };
  const hasFilters =
    filterDateFrom ||
    filterDateTo ||
    filterProduct ||
    filterNetwork ||
    filterDealer;

  const thStyle = {
    fontSize: 11,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 500,
    whiteSpace: "nowrap",
    borderBottom: "0.5px solid #e5e7eb",
    background: "#fafafa",
    padding: "10px 12px",
  };
  const tdStyle = {
    fontSize: 13,
    color: "#374151",
    padding: "10px 12px",
    borderBottom: "0.5px solid #f3f4f6",
  };
  const tfStyle = {
    fontSize: 13,
    fontWeight: 700,
    color: "#111827",
    padding: "10px 12px",
    borderBottom: "none",
    background: "#f8f9fb",
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
            Προμήθειες
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
            {filtered.length} εγγραφές
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportExcel}
          sx={{ borderColor: "#e5e7eb", color: "#374151" }}
        >
          Εξαγωγή Excel
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Φίλτρα */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 2, borderRadius: 2, border: "0.5px solid #e5e7eb" }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          flexWrap="wrap"
          alignItems="center"
          useFlexGap
        >
          <TextField
            size="small"
            label="Από ημερομηνία"
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: 170,
              "& .MuiOutlinedInput-root": {
                background: "#fff",
                color: "#111827",
              },
            }}
          />
          <TextField
            size="small"
            label="Έως ημερομηνία"
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: 170,
              "& .MuiOutlinedInput-root": {
                background: "#fff",
                color: "#111827",
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Προϊόν</InputLabel>
            <Select
              value={filterProduct}
              label="Προϊόν"
              onChange={(e) => setFilterProduct(e.target.value)}
            >
              <MenuItem value="">Όλα</MenuItem>
              {products.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Δίκτυο</InputLabel>
            <Select
              value={filterNetwork}
              label="Δίκτυο"
              onChange={(e) => setFilterNetwork(e.target.value)}
            >
              <MenuItem value="">Όλα</MenuItem>
              {networks.map((n) => (
                <MenuItem key={n.id} value={n.id}>
                  {n.eponymia}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Dealer</InputLabel>
            <Select
              value={filterDealer}
              label="Dealer"
              onChange={(e) => setFilterDealer(e.target.value)}
            >
              <MenuItem value="">Όλοι</MenuItem>
              {dealers.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.eponymia}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {hasFilters && (
            <Button
              size="small"
              onClick={clearFilters}
              sx={{ color: "#9ca3af", fontSize: 12 }}
            >
              Καθαρισμός ✕
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Πίνακας */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "0.5px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Ημερομηνία</th>
                  <th style={thStyle}>Προϊόν</th>
                  <th style={thStyle}>Πελάτης</th>
                  <th style={thStyle}>ΑΦΜ</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Ποσό</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>
                    Προμήθεια Dealer
                  </th>
                  <th style={{ ...thStyle, textAlign: "right" }}>
                    Προμήθεια Network
                  </th>
                  <th style={{ ...thStyle, textAlign: "center" }}>
                    Πληρώθηκε Dealer
                  </th>
                  <th style={{ ...thStyle, textAlign: "center" }}>
                    Πληρώθηκε Network
                  </th>
                  <th style={thStyle}>Παραστατικό</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      style={{
                        padding: 40,
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: 14,
                      }}
                    >
                      Δεν βρέθηκαν εγγραφές
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={tdStyle}>{r.date}</td>
                      <td style={tdStyle}>
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "#374151",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.product}
                        </Typography>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: 500,
                          color: "#111827",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.customer}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          fontFamily: "monospace",
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        {r.afm}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "right",
                          fontFamily: "monospace",
                          fontWeight: 600,
                        }}
                      >
                        €{r.amount.toFixed(2)}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "right",
                          fontFamily: "monospace",
                          fontWeight: 600,
                          color: "#1d4ed8",
                        }}
                      >
                        €{r.dealerCommission.toFixed(2)}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "right",
                          fontFamily: "monospace",
                          fontWeight: 600,
                          color: "#6d28d9",
                        }}
                      >
                        {r.networkCommission > 0
                          ? `€${r.networkCommission.toFixed(2)}`
                          : "—"}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <Checkbox
                          checked={r.paidDealer}
                          onChange={() => togglePaidDealer(r.id)}
                          size="small"
                          sx={{
                            color: "#d1d5db",
                            "&.Mui-checked": { color: "#16a34a" },
                          }}
                        />
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <Checkbox
                          checked={r.paidNetwork}
                          onChange={() => togglePaidNetwork(r.id)}
                          size="small"
                          sx={{
                            color: "#d1d5db",
                            "&.Mui-checked": { color: "#16a34a" },
                          }}
                        />
                      </td>
                      <td style={{ ...tdStyle, minWidth: 120 }}>
                        <TextField
                          size="small"
                          variant="standard"
                          value={r.receipt}
                          onChange={(e) => updateReceipt(r.id, e.target.value)}
                          placeholder="—"
                          inputProps={{
                            style: { fontSize: 12, padding: "2px 4px" },
                          }}
                          sx={{
                            width: 110,
                            "& .MuiInput-underline:before": {
                              borderBottomColor: "#e5e7eb",
                            },
                          }}
                        />
                      </td>
                      <td style={{ ...tdStyle }}>
                        <Tooltip title="Διαγραφή">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(r.id)}
                            sx={{
                              color: "#9ca3af",
                              "&:hover": { color: "#ef4444" },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {/* Σύνολα */}
              {filtered.length > 0 && (
                <tfoot>
                  <tr
                    style={{
                      background: "#f8f9fb",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <td
                      colSpan={4}
                      style={{ ...tfStyle, fontSize: 12, color: "#6b7280" }}
                    >
                      Σύνολα ({filtered.length} εγγραφές)
                    </td>
                    <td
                      style={{
                        ...tfStyle,
                        textAlign: "right",
                        fontFamily: "monospace",
                        color: "#111827",
                      }}
                    >
                      €{totalAmount.toFixed(2)}
                    </td>
                    <td
                      style={{
                        ...tfStyle,
                        textAlign: "right",
                        fontFamily: "monospace",
                        color: "#1d4ed8",
                      }}
                    >
                      €{totalDealerCommission.toFixed(2)}
                    </td>
                    <td
                      style={{
                        ...tfStyle,
                        textAlign: "right",
                        fontFamily: "monospace",
                        color: "#6d28d9",
                      }}
                    >
                      €{totalNetworkCommission.toFixed(2)}
                    </td>
                    <td colSpan={4} style={tfStyle}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
