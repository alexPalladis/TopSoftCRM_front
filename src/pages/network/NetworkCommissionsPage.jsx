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
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { commissionsApi } from "../../services/commissions";
import { dealersApi } from "../../services/dealers";
import { productsApi } from "../../services/products";
import { useAuth } from "../../context/AuthContext";

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

  const PER_PAGE = 20;

  useEffect(() => {
    productsApi
      .getAll()
      .then((r) => setProducts(r.data))
      .catch(() => {});
    // Φόρτωσε μόνο dealers που ανήκουν στο network
    dealersApi
      .getAll({ networkId: user?.id, size: 100 })
      .then((r) => setDealers(r.data.content))
      .catch(() => {});
  }, [user]);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size: PER_PAGE,
        networkId: user?.id, // Εσωτερικό φίλτρο — ΜΟΝΟ του network
        ...(filterDateFrom && { dateFrom: filterDateFrom }),
        ...(filterDateTo && { dateTo: filterDateTo }),
        ...(filterProductId && { productId: filterProductId }),
        ...(filterDealerId && { dealerId: filterDealerId }),
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
  }, [
    page,
    filterDateFrom,
    filterDateTo,
    filterProductId,
    filterDealerId,
    user,
  ]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  // Σύνολα
  const totalAmount = rows.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalDealerCommission = rows.reduce(
    (s, r) => s + Number(r.dealerCommissionAmount || 0),
    0,
  );
  const totalNetworkCommission = rows.reduce(
    (s, r) => s + Number(r.networkCommissionAmount || 0),
    0,
  );

  const exportExcel = () => {
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
    csvRows.push(
      [
        "",
        "",
        "",
        "Σύνολα",
        totalAmount.toFixed(2),
        "",
        totalDealerCommission.toFixed(2),
        totalNetworkCommission.toFixed(2),
        "",
        "",
        "",
      ].join(","),
    );
    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "promithies_network.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterProductId("");
    setFilterDealerId("");
    setPage(0);
  };
  const hasFilters =
    filterDateFrom || filterDateTo || filterProductId || filterDealerId;

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
            {total} εγγραφές — μόνο του δικτύου σας · Ενημερώνεται αυτόματα από
            την τιμολογιέρα
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportExcel}
          sx={{ borderColor: "#e5e7eb", color: "#374151", borderRadius: 2 }}
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
            onChange={(e) => {
              setFilterDateFrom(e.target.value);
              setPage(0);
            }}
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
            onChange={(e) => {
              setFilterDateTo(e.target.value);
              setPage(0);
            }}
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
              onChange={(e) => {
                setFilterProductId(e.target.value);
                setPage(0);
              }}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="">Όλα</MenuItem>
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Dealer</InputLabel>
            <Select
              value={filterDealerId}
              label="Dealer"
              onChange={(e) => {
                setFilterDealerId(e.target.value);
                setPage(0);
              }}
              sx={{ borderRadius: 1.5 }}
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
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
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
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        {r.paymentDate}
                      </td>
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
                          {r.dealerName}
                        </Typography>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {r.networkCommissionAmount > 0 ? (
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontFamily: "monospace",
                              fontWeight: 600,
                              color: "#6d28d9",
                            }}
                          >
                            €{Number(r.networkCommissionAmount).toFixed(2)}
                          </Typography>
                        ) : (
                          <span style={{ color: "#d1d5db" }}>—</span>
                        )}
                      </td>
                      {/* Checkboxes — read only για Network */}
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: r.paidDealer ? "#16a34a" : "#9ca3af",
                            fontWeight: r.paidDealer ? 600 : 400,
                          }}
                        >
                          {r.paidDealer ? "✓ Ναι" : "Όχι"}
                        </Typography>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        {r.networkCommissionAmount > 0 ? (
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: r.paidNetwork ? "#16a34a" : "#9ca3af",
                              fontWeight: r.paidNetwork ? 600 : 400,
                            }}
                          >
                            {r.paidNetwork ? "✓ Ναι" : "Όχι"}
                          </Typography>
                        ) : (
                          <span style={{ color: "#d1d5db", fontSize: 12 }}>
                            —
                          </span>
                        )}
                      </td>
                      {/* Παραστατικό — read only για Network */}
                      <td
                        style={{ ...tdStyle, fontSize: 12, color: "#374151" }}
                      >
                        {r.receipt || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* Σύνολα */}
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
                      {totalNetworkCommission > 0
                        ? `€${totalNetworkCommission.toFixed(2)}`
                        : "—"}
                    </td>
                    <td colSpan={3} style={tfStyle}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </Box>
        )}

        {/* Pagination + info footer */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderTop: "0.5px solid #e5e7eb",
            background: "#fafafa",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
            Μόνο ανάγνωση · Οι εγγραφές ενημερώνονται αυτόματα από την
            τιμολογιέρα
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
