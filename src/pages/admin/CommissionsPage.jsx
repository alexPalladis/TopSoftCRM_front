import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Stack,
  CircularProgress,
  Alert,
  Checkbox,
  Snackbar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { commissionsApi } from "../../services/commissions";
import { dealersApi } from "../../services/dealers";
import { networksApi } from "../../services/networks";
import { productsApi } from "../../services/products";

const PER_PAGE = 20;

function fmt(val) {
  if (val == null) return "—";
  return `€${Number(val).toFixed(2)}`;
}

export default function CommissionsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [snack, setSnack] = useState("");

  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterProductId, setFilterProductId] = useState("");
  const [filterNetworkId, setFilterNetworkId] = useState("");
  const [filterDealerId, setFilterDealerId] = useState("");

  const [products, setProducts] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [dealers, setDealers] = useState([]);

  // Load dropdown data once
  useEffect(() => {
    productsApi
      .getAll()
      .then((r) => setProducts(r.data))
      .catch(() => {});
    networksApi
      .getAll({ size: 200 })
      .then((r) => setNetworks(r.data.content))
      .catch(() => {});
    dealersApi
      .getAll({ size: 500 })
      .then((r) => setDealers(r.data.content))
      .catch(() => {});
  }, []);

  const buildParams = useCallback(
    () => ({
      page,
      size: PER_PAGE,
      ...(filterDateFrom && { dateFrom: filterDateFrom }),
      ...(filterDateTo && { dateTo: filterDateTo }),
      ...(filterProductId && { productId: filterProductId }),
      ...(filterNetworkId && { networkId: filterNetworkId }),
      ...(filterDealerId && { dealerId: filterDealerId }),
    }),
    [
      page,
      filterDateFrom,
      filterDateTo,
      filterProductId,
      filterNetworkId,
      filterDealerId,
    ],
  );

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await commissionsApi.getHistory(buildParams());
      setRows(res.data.content);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Σφάλμα φόρτωσης δεδομένων");
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const clearFilters = () => {
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterProductId("");
    setFilterNetworkId("");
    setFilterDealerId("");
    setPage(0);
  };

  // ── Admin mutations ──────────────────────────────────────────────────────
  const togglePaidDealer = async (id) => {
    try {
      const res = await commissionsApi.togglePaidDealer(id);
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, paidDealer: res.data.paidDealer } : r,
        ),
      );
    } catch {
      setSnack("Σφάλμα ενημέρωσης");
    }
  };

  const togglePaidNetwork = async (id) => {
    try {
      const res = await commissionsApi.togglePaidNetwork(id);
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, paidNetwork: res.data.paidNetwork } : r,
        ),
      );
    } catch {
      setSnack("Σφάλμα ενημέρωσης");
    }
  };

  // Optimistic local update; save on blur
  const updateReceiptLocal = (id, val) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, receipt: val } : r)),
    );

  const saveReceipt = async (id, val) => {
    try {
      await commissionsApi.updateReceipt(id, val);
    } catch {
      setSnack("Σφάλμα αποθήκευσης παραστατικού");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Διαγραφή εγγραφής;")) return;
    try {
      await commissionsApi.deleteHistory(id);
      fetchRows();
    } catch (err) {
      setSnack(err.response?.data?.error || "Σφάλμα διαγραφής");
    }
  };

  // ── Excel export ─────────────────────────────────────────────────────────
  const exportExcel = () => {
    // Client-side CSV export (all currently visible rows + headers)
    const header = [
      "Ημερομηνία",
      "Προϊόν",
      "Πελάτης",
      "ΑΦΜ",
      "Ποσό",
      "Dealer",
      "Network",
      "Προμήθεια Dealer",
      "Προμήθεια Network",
      "Πληρώθηκε Dealer",
      "Πληρώθηκε Network",
      "Παραστατικό",
    ];
    const csvRows = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.paymentDate,
          `"${r.productDescription}"`,
          `"${r.customerEponymia}"`,
          r.customerAfm,
          r.amount,
          `"${r.dealerName}"`,
          `"${r.networkName || ""}"`,
          r.dealerCommissionAmount,
          r.networkCommissionAmount || 0,
          r.paidDealer ? "Ναι" : "Όχι",
          r.paidNetwork ? "Ναι" : "Όχι",
          `"${r.receipt || ""}"`,
        ].join(","),
      ),
    ];
    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promoithies_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasFilters =
    filterDateFrom ||
    filterDateTo ||
    filterProductId ||
    filterNetworkId ||
    filterDealerId;

  // ── Totals row ───────────────────────────────────────────────────────────
  const totalDealer = rows.reduce(
    (s, r) => s + (Number(r.dealerCommissionAmount) || 0),
    0,
  );
  const totalNetwork = rows.reduce(
    (s, r) => s + (Number(r.networkCommissionAmount) || 0),
    0,
  );

  // ── Styles ───────────────────────────────────────────────────────────────
  const thSx = {
    padding: "10px 12px",
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
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
          Προμήθειες
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={exportExcel}
          disabled={rows.length === 0}
          sx={{
            borderColor: "#e5e7eb",
            color: "#374151",
            "&:hover": { borderColor: "#9ca3af" },
          }}
        >
          Εξαγωγή CSV
        </Button>
      </Box>

      {/* ── Filters ── */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 2, border: "0.5px solid #e5e7eb", borderRadius: 2 }}
      >
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <TextField
            label="Από ημερομηνία"
            type="date"
            size="small"
            value={filterDateFrom}
            onChange={(e) => {
              setFilterDateFrom(e.target.value);
              setPage(0);
            }}
            slotProps={{
              inputLabel: { shrink: true },
              input: { notched: true },
            }}
            sx={{ minWidth: 160 }}
          />
          <TextField
            label="Έως ημερομηνία"
            type="date"
            size="small"
            value={filterDateTo}
            onChange={(e) => {
              setFilterDateTo(e.target.value);
              setPage(0);
            }}
            slotProps={{
              inputLabel: { shrink: true },
              input: { notched: true },
            }}
            sx={{ minWidth: 160 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Προϊόν</InputLabel>
            <Select
              value={filterProductId}
              label="Προϊόν"
              onChange={(e) => {
                setFilterProductId(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Όλα</MenuItem>
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Δίκτυο</InputLabel>
            <Select
              value={filterNetworkId}
              label="Δίκτυο"
              onChange={(e) => {
                setFilterNetworkId(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Όλα</MenuItem>
              {networks.map((n) => (
                <MenuItem key={n.id} value={n.id}>
                  {n.eponymia}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Dealer</InputLabel>
            <Select
              value={filterDealerId}
              label="Dealer"
              onChange={(e) => {
                setFilterDealerId(e.target.value);
                setPage(0);
              }}
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
            <Tooltip title="Καθαρισμός φίλτρων">
              <IconButton size="small" onClick={clearFilters}>
                <FilterListOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 1 }}>
          {total} εγγραφές
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* ── Table ── */}
      <Paper
        elevation={0}
        sx={{
          border: "0.5px solid #e5e7eb",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thSx}>Ημερομηνία</th>
                  <th style={thSx}>Προϊόν</th>
                  <th style={thSx}>Πελάτης</th>
                  <th style={thSx}>ΑΦΜ</th>
                  <th style={{ ...thSx, textAlign: "right" }}>Ποσό</th>
                  <th style={{ ...thSx, textAlign: "right" }}>Προμ. Dealer</th>
                  <th style={{ ...thSx, textAlign: "right" }}>Προμ. Network</th>
                  <th style={{ ...thSx, textAlign: "center" }}>Πληρ. Dealer</th>
                  <th style={{ ...thSx, textAlign: "center" }}>
                    Πληρ. Network
                  </th>
                  <th style={thSx}>Παραστατικό</th>
                  <th style={{ ...thSx, textAlign: "center" }}>Ενέργεια</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      style={{
                        padding: "32px",
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: 13,
                      }}
                    >
                      Δεν βρέθηκαν εγγραφές
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr
                      key={r.id}
                      style={{ background: idx % 2 === 0 ? "#fff" : "#fafafa" }}
                    >
                      <td
                        style={{
                          padding: "8px 12px",
                          fontSize: 12,
                          color: "#6b7280",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.paymentDate}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontSize: 13,
                          color: "#374151",
                        }}
                      >
                        {r.productDescription}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontSize: 13,
                          color: "#111827",
                        }}
                      >
                        {r.customerEponymia}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontSize: 12,
                          color: "#6b7280",
                          fontFamily: "monospace",
                        }}
                      >
                        {r.customerAfm}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontSize: 13,
                          textAlign: "right",
                          color: "#111827",
                          fontWeight: 500,
                        }}
                      >
                        {fmt(r.amount)}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontSize: 13,
                          textAlign: "right",
                          color: "#16a34a",
                          fontWeight: 600,
                        }}
                      >
                        {fmt(r.dealerCommissionAmount)}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontSize: 13,
                          textAlign: "right",
                          color: "#3b82f6",
                          fontWeight: 600,
                        }}
                      >
                        {fmt(r.networkCommissionAmount)}
                      </td>
                      {/* Πληρώθηκε Dealer — ΜΟΝΟ admin το αλλάζει */}
                      <td style={{ padding: "4px 12px", textAlign: "center" }}>
                        <Tooltip
                          title={r.paidDealer ? "Πληρώθηκε" : "Εκκρεμεί"}
                        >
                          <Checkbox
                            checked={!!r.paidDealer}
                            onChange={() => togglePaidDealer(r.id)}
                            size="small"
                            sx={{
                              color: "#d1d5db",
                              "&.Mui-checked": { color: "#16a34a" },
                            }}
                          />
                        </Tooltip>
                      </td>
                      {/* Πληρώθηκε Network — ΜΟΝΟ admin το αλλάζει */}
                      <td style={{ padding: "4px 12px", textAlign: "center" }}>
                        <Tooltip
                          title={r.paidNetwork ? "Πληρώθηκε" : "Εκκρεμεί"}
                        >
                          <Checkbox
                            checked={!!r.paidNetwork}
                            onChange={() => togglePaidNetwork(r.id)}
                            size="small"
                            sx={{
                              color: "#d1d5db",
                              "&.Mui-checked": { color: "#3b82f6" },
                            }}
                          />
                        </Tooltip>
                      </td>
                      {/* Παραστατικό — ΜΟΝΟ admin γράφει */}
                      <td style={{ padding: "4px 12px" }}>
                        <TextField
                          size="small"
                          value={r.receipt || ""}
                          onChange={(e) =>
                            updateReceiptLocal(r.id, e.target.value)
                          }
                          onBlur={(e) => saveReceipt(r.id, e.target.value)}
                          placeholder="—"
                          inputProps={{
                            maxLength: 100,
                            style: { fontSize: 12, padding: "4px 8px" },
                          }}
                          sx={{
                            width: 120,
                            "& .MuiOutlinedInput-root": { borderRadius: 1 },
                          }}
                        />
                      </td>
                      <td style={{ padding: "4px 12px", textAlign: "center" }}>
                        <Tooltip title="Διαγραφή">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(r.id)}
                            sx={{ color: "#ef4444" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {/* Totals footer */}
              {rows.length > 0 && (
                <tfoot>
                  <tr
                    style={{
                      background: "#f9fafb",
                      borderTop: "1.5px solid #e5e7eb",
                    }}
                  >
                    <td
                      colSpan={5}
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#6b7280",
                        fontWeight: 600,
                      }}
                    >
                      Σύνολα σελίδας ({rows.length} εγγραφές)
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        textAlign: "right",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#16a34a",
                      }}
                    >
                      {fmt(totalDealer)}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        textAlign: "right",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#3b82f6",
                      }}
                    >
                      {fmt(totalNetwork)}
                    </td>
                    <td colSpan={4} />
                  </tr>
                </tfoot>
              )}
            </table>
          </Box>
        )}
      </Paper>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            mt: 2,
          }}
        >
          <Button
            size="small"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            sx={{ color: "#374151" }}
          >
            ← Προηγούμενη
          </Button>
          <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
            Σελίδα {page + 1} / {totalPages}
          </Typography>
          <Button
            size="small"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            sx={{ color: "#374151" }}
          >
            Επόμενη →
          </Button>
        </Box>
      )}

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack("")}
        message={snack}
      />
    </Box>
  );
}
