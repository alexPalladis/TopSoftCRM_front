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
    // Load only dealers that belong to this network
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
        // networkId is ignored by backend — always scoped server-side to this network
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

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 2, border: "0.5px solid #e5e7eb", borderRadius: 2 }}
      >
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <TextField
            label="Από"
            type="date"
            size="small"
            value={filterDateFrom}
            onChange={(e) => {
              setFilterDateFrom(e.target.value);
              setPage(0);
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 155 }}
          />
          <TextField
            label="Έως"
            type="date"
            size="small"
            value={filterDateTo}
            onChange={(e) => {
              setFilterDateTo(e.target.value);
              setPage(0);
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 155 }}
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
                  <th style={thSx}>Dealer</th>
                  <th style={{ ...thSx, textAlign: "right" }}>Προμ. Dealer</th>
                  <th style={{ ...thSx, textAlign: "right" }}>Προμ. Network</th>
                  <th style={{ ...thSx, textAlign: "center" }}>Πληρ. Dealer</th>
                  <th style={{ ...thSx, textAlign: "center" }}>
                    Πληρ. Network
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
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
                      {/* Read-only icons — network ΜΟΝΟ βλέπει */}
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
                    </tr>
                  ))
                )}
              </tbody>
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
                    <td colSpan={2} />
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
