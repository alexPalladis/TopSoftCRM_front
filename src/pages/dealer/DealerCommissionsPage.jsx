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
  Stack,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import LockIcon from "@mui/icons-material/Lock";
import { commissionsApi } from "../../services/commissions";
import { productsApi } from "../../services/products";
import { useAuth } from "../../context/AuthContext";

const PER_PAGE = 20;

export default function DealerCommissionsPage() {
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);

  // Filters — only date range and product per spec
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterProductId, setFilterProductId] = useState("");

  const [products, setProducts] = useState([]);

  // Load product list once for the filter dropdown
  useEffect(() => {
    productsApi
      .getAll()
      .then((r) => setProducts(r.data))
      .catch(() => {});
  }, []);

  const fetchRows = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size: PER_PAGE,
        dealerId: user.id, // scoped to this dealer only
        ...(filterDateFrom && { dateFrom: filterDateFrom }),
        ...(filterDateTo && { dateTo: filterDateTo }),
        ...(filterProductId && { productId: filterProductId }),
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
  }, [page, filterDateFrom, filterDateTo, filterProductId, user]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setPage(0);
  };

  const clearFilters = () => {
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterProductId("");
    setPage(0);
  };
  const hasFilters = filterDateFrom || filterDateTo || filterProductId;

  // Totals — sum only for the current page (consistent with Admin CommissionsPage)
  const totalDealerCommission = rows.reduce(
    (s, r) => s + Number(r.dealerCommissionAmount || 0),
    0,
  );
  const totalAmount = rows.reduce((s, r) => s + Number(r.amount || 0), 0);

  // ── Excel export ────────────────────────────────────────────
  // Dealer sees: Date, Product, Customer, AFM, Amount, Commission, Paid
  // Does NOT see: receipt, network commission, delete — those are admin-only
  const exportExcel = () => {
    const header = [
      "Ημερομηνία",
      "Προϊόν",
      "Πελάτης",
      "ΑΦΜ",
      "Ποσό",
      "Προμήθεια Dealer",
      "Πληρώθηκε",
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
          r.dealerCommissionAmount,
          r.paidDealer ? "Ναι" : "Όχι",
        ].join(","),
      ),
    ];
    // Totals row
    csvRows.push(
      [
        "",
        "",
        "",
        "Σύνολα",
        totalAmount.toFixed(2),
        totalDealerCommission.toFixed(2),
        "",
      ].join(","),
    );

    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "promithies_dealer.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const thStyle = {
    padding: "10px 12px",
    textAlign: "left",
    fontSize: 11,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 500,
    borderBottom: "0.5px solid #e5e7eb",
    background: "#fafafa",
    whiteSpace: "nowrap",
  };
  const tdStyle = {
    padding: "10px 12px",
    borderBottom: "0.5px solid #f3f4f6",
    fontSize: 13,
    color: "#374151",
  };
  const tfStyle = {
    padding: "10px 12px",
    fontWeight: 700,
    color: "#111827",
    background: "#f8f9fb",
    fontSize: 13,
  };

  return (
    <Box>
      {/* Header */}
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
            {total} εγγραφές · Ενημερώνεται αυτόματα από την τιμολογιέρα
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Read-only badge */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.5,
              py: 0.6,
              borderRadius: 2,
              background: "#f3f4f6",
            }}
          >
            <LockIcon sx={{ fontSize: 13, color: "#9ca3af" }} />
            <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
              Μόνο προβολή
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportExcel}
            disabled={rows.length === 0}
            sx={{ borderColor: "#e5e7eb", color: "#374151", borderRadius: 2 }}
          >
            ΕΞΑΓΩΓΗ EXCEL
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters — date range + product only */}
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
            onChange={(e) =>
              handleFilterChange(setFilterDateFrom)(e.target.value)
            }
            slotProps={{
              inputLabel: { shrink: true },
              input: { notched: true },
            }}
            sx={{
              width: 170,
              "& .MuiOutlinedInput-root": {
                background: "#fff",
                color: "#111827",
                borderRadius: 1.5,
              },
            }}
          />
          <TextField
            size="small"
            label="Έως ημερομηνία"
            type="date"
            value={filterDateTo}
            onChange={(e) =>
              handleFilterChange(setFilterDateTo)(e.target.value)
            }
            slotProps={{
              inputLabel: { shrink: true },
              input: { notched: true },
            }}
            sx={{
              width: 170,
              "& .MuiOutlinedInput-root": {
                background: "#fff",
                color: "#111827",
                borderRadius: 1.5,
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Προϊόν</InputLabel>
            <Select
              value={filterProductId}
              label="Προϊόν"
              sx={{ borderRadius: 1.5 }}
              onChange={(e) =>
                handleFilterChange(setFilterProductId)(e.target.value)
              }
            >
              <MenuItem value="">Όλα</MenuItem>
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.description}
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

      {/* Table */}
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
                  <th style={{ ...thStyle, textAlign: "center" }}>Πληρώθηκε</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
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
                  rows.map((r) => (
                    <tr
                      key={r.id}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Date */}
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        {r.paymentDate}
                      </td>

                      {/* Product */}
                      <td style={{ ...tdStyle, maxWidth: 160 }}>
                        <Typography
                          sx={{
                            fontSize: 12,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 160,
                          }}
                        >
                          {r.productDescription}
                        </Typography>
                      </td>

                      {/* Customer */}
                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: 500,
                          color: "#111827",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.customerEponymia}
                      </td>

                      {/* AFM */}
                      <td
                        style={{
                          ...tdStyle,
                          fontFamily: "monospace",
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        {r.customerAfm}
                      </td>

                      {/* Amount */}
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "right",
                          fontFamily: "monospace",
                          fontWeight: 600,
                          color: "#111827",
                        }}
                      >
                        €{Number(r.amount).toFixed(2)}
                      </td>

                      {/* Dealer commission — read-only display */}
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontFamily: "monospace",
                            fontWeight: 600,
                            color: "#1d4ed8",
                          }}
                        >
                          €{Number(r.dealerCommissionAmount).toFixed(2)}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>
                          {Number(r.dealerCommissionPct).toFixed(0)}%
                        </Typography>
                      </td>

                      {/* Paid status — read-only chip, no checkbox */}
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <Chip
                          label={r.paidDealer ? "Ναι" : "Όχι"}
                          size="small"
                          sx={{
                            fontSize: 11,
                            height: 22,
                            background: r.paidDealer ? "#dcfce7" : "#f3f4f6",
                            color: r.paidDealer ? "#166534" : "#6b7280",
                            fontWeight: r.paidDealer ? 600 : 400,
                          }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* Totals footer */}
              {rows.length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: "2px solid #e5e7eb" }}>
                    <td
                      colSpan={4}
                      style={{ ...tfStyle, color: "#6b7280", fontSize: 12 }}
                    >
                      Σύνολα ({total} εγγραφές)
                    </td>
                    <td
                      style={{
                        ...tfStyle,
                        textAlign: "right",
                        fontFamily: "monospace",
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
                    <td style={tfStyle}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </Box>
        )}

        {/* Pagination + footer note */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: "0.5px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fafafa",
          }}
        >
          <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
            Οι εγγραφές έρχονται αυτόματα από την τιμολογιέρα · Μόνο ανάγνωση
          </Typography>
          <Stack direction="row" spacing={0.5}>
            {[...Array(totalPages)].map((_, i) => (
              <Box
                key={i}
                onClick={() => setPage(i)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: page === i ? 600 : 400,
                  background: page === i ? "#1f6feb" : "transparent",
                  color: page === i ? "#fff" : "#6b7280",
                  border: "0.5px solid",
                  borderColor: page === i ? "#1f6feb" : "#e5e7eb",
                }}
              >
                {i + 1}
              </Box>
            ))}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
