import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { commissionsApi } from "../../services/commissions";
import { dealersApi } from "../../services/dealers";
import { productsApi } from "../../services/products";
import { useAuth } from "../../context/AuthContext";
import TablePagination from "../../components/shared/TablePagination";

const PER_PAGE = 20;

function fmt(val) {
  if (val == null) return "—";
  return `€${Number(val).toFixed(2)}`;
}

export default function NetworkCommissionsPage() {
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);

  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterProductId, setFilterProductId] = useState("");
  const [filterDealerId, setFilterDealerId] = useState("");

  const [products, setProducts] = useState([]);
  const [dealers, setDealers] = useState([]);

  useEffect(() => {
    productsApi
      .getAll()
      .then((r) => setProducts(r.data))
      .catch(() => {});
    // Φόρτωσε μόνο dealers που ανήκουν σε αυτό το network
    dealersApi
      .getAll({ networkId: user?.id, size: 500 })
      .then((r) => setDealers(r.data.content))
      .catch(() => {});
  }, [user?.id]);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size: PER_PAGE,
        ...(filterDateFrom && { dateFrom: filterDateFrom }),
        ...(filterDateTo && { dateTo: filterDateTo }),
        ...(filterProductId && { productId: filterProductId }),
        ...(filterDealerId && { dealerId: filterDealerId }),
        // networkId αγνοείται από το backend — scoped server-side αυτόματα
      };
      const res = await commissionsApi.getHistory(params);
      setRows(res.data.content);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Σφάλμα φόρτωσης δεδομένων");
    } finally {
      setLoading(false);
    }
  }, [page, filterDateFrom, filterDateTo, filterProductId, filterDealerId]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const clearFilters = () => {
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterProductId("");
    setFilterDealerId("");
    setPage(0);
  };

  // ── CSV export — περιλαμβάνει Παραστατικό (read-only για network) ──────────
  const exportCsv = () => {
    const header = [
      "Ημερομηνία",
      "Προϊόν",
      "Πελάτης",
      "ΑΦΜ",
      "Ποσό",
      "Dealer",
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
    a.download = `promoithies_network_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalDealer = rows.reduce(
    (s, r) => s + (Number(r.dealerCommissionAmount) || 0),
    0,
  );
  const totalNetwork = rows.reduce(
    (s, r) => s + (Number(r.networkCommissionAmount) || 0),
    0,
  );
  const hasFilters =
    filterDateFrom || filterDateTo || filterProductId || filterDealerId;

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
      {/* ── Header ─────────────────────────────────────────────────────────── */}
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
          onClick={exportCsv}
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

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "0.5px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {/* ── Filters ──────────────────────────────────────────────────────── */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "0.5px solid #e5e7eb",
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            type="date"
            label="Από"
            value={filterDateFrom}
            onChange={(e) => {
              setFilterDateFrom(e.target.value);
              setPage(0);
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150, "& .MuiInputBase-root": { fontSize: 13 } }}
          />
          <TextField
            size="small"
            type="date"
            label="Έως"
            value={filterDateTo}
            onChange={(e) => {
              setFilterDateTo(e.target.value);
              setPage(0);
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150, "& .MuiInputBase-root": { fontSize: 13 } }}
          />
          <FormControl size="small" sx={{ width: 170 }}>
            <InputLabel sx={{ fontSize: 13 }}>Προϊόν</InputLabel>
            <Select
              value={filterProductId}
              label="Προϊόν"
              onChange={(e) => {
                setFilterProductId(e.target.value);
                setPage(0);
              }}
              sx={{ fontSize: 13 }}
            >
              <MenuItem value="">Όλα</MenuItem>
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ width: 200 }}>
            <InputLabel sx={{ fontSize: 13 }}>Dealer</InputLabel>
            <Select
              value={filterDealerId}
              label="Dealer"
              onChange={(e) => {
                setFilterDealerId(e.target.value);
                setPage(0);
              }}
              sx={{ fontSize: 13 }}
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
              <IconButton
                size="small"
                onClick={clearFilters}
                sx={{ color: "#9ca3af" }}
              >
                <FilterListOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
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
                  <th style={thSx}>Dealer</th>
                  <th style={{ ...thSx, textAlign: "right" }}>Προμ. Dealer</th>
                  <th style={{ ...thSx, textAlign: "right" }}>Προμ. Network</th>
                  <th style={{ ...thSx, textAlign: "center" }}>Πληρ. Dealer</th>
                  <th style={{ ...thSx, textAlign: "center" }}>
                    Πληρ. Network
                  </th>
                  {/* ── ΝΕΕΣ ΣΤΗΛΕΣ ── */}
                  <th style={thSx}>Παραστατικό</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      style={{
                        padding: 32,
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
                          fontWeight: 500,
                        }}
                      >
                        {fmt(r.amount)}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontSize: 13,
                          color: "#374151",
                        }}
                      >
                        {r.dealerName}
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
                      {/* Πληρώθηκε Dealer — read-only για Network */}
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        {r.paidDealer ? (
                          <CheckCircleIcon
                            fontSize="small"
                            sx={{ color: "#16a34a" }}
                          />
                        ) : (
                          <RadioButtonUncheckedIcon
                            fontSize="small"
                            sx={{ color: "#d1d5db" }}
                          />
                        )}
                      </td>
                      {/* Πληρώθηκε Network — read-only για Network */}
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        {r.paidNetwork ? (
                          <CheckCircleIcon
                            fontSize="small"
                            sx={{ color: "#3b82f6" }}
                          />
                        ) : (
                          <RadioButtonUncheckedIcon
                            fontSize="small"
                            sx={{ color: "#d1d5db" }}
                          />
                        )}
                      </td>
                      {/* ── Παραστατικό — read-only για Network, ορίζεται από Admin ── */}
                      <td
                        style={{
                          padding: "8px 12px",
                          fontSize: 13,
                          color: "#374151",
                          maxWidth: 160,
                        }}
                      >
                        {r.receipt ? (
                          <Tooltip title={r.receipt}>
                            <Typography
                              sx={{
                                fontSize: 12,
                                color: "#374151",
                                maxWidth: 140,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                cursor: "default",
                              }}
                            >
                              {r.receipt}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography sx={{ fontSize: 12, color: "#d1d5db" }}>
                            —
                          </Typography>
                        )}
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
                      colSpan={6}
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
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              )}
            </table>
          </Box>
        )}
      </Paper>

      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        perPage={PER_PAGE}
        onPageChange={setPage}
        standalone
      />
    </Box>
  );
}
