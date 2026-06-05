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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { commissionsApi } from "../../services/commissions";
import { dealersApi } from "../../services/dealers";
import { networksApi } from "../../services/networks";
import { productsApi } from "../../services/products";

export default function CommissionsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);

  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterProductId, setFilterProductId] = useState("");
  const [filterNetworkId, setFilterNetworkId] = useState("");
  const [filterDealerId, setFilterDealerId] = useState("");

  const [products, setProducts] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [dealers, setDealers] = useState([]);

  const PER_PAGE = 20;

  useEffect(() => {
    productsApi
      .getAll()
      .then((r) => setProducts(r.data))
      .catch(() => {});
    networksApi
      .getAll({ size: 100 })
      .then((r) => setNetworks(r.data.content))
      .catch(() => {});
    dealersApi
      .getAll({ size: 100 })
      .then((r) => setDealers(r.data.content))
      .catch(() => {});
  }, []);

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
        ...(filterNetworkId && { networkId: filterNetworkId }),
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
    filterNetworkId,
    filterDealerId,
  ]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const togglePaidDealer = async (id) => {
    try {
      const res = await commissionsApi.togglePaidDealer(id);
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, paidDealer: res.data.paidDealer } : r,
        ),
      );
    } catch {
      alert("Σφάλμα");
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
      alert("Σφάλμα");
    }
  };

  const updateReceipt = async (id, val) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, receipt: val } : r)),
    );
  };

  const saveReceipt = async (id, val) => {
    try {
      await commissionsApi.updateReceipt(id, val);
    } catch {
      alert("Σφάλμα αποθήκευσης παραστατικού");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Διαγραφή εγγραφής;")) return;
    try {
      await commissionsApi.deleteHistory(id);
      fetchRows();
    } catch (err) {
      alert(err.response?.data?.error || "Σφάλμα");
    }
  };

  const exportExcel = () => {
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
    const totalDC = rows.reduce(
      (s, r) => s + Number(r.dealerCommissionAmount || 0),
      0,
    );
    const totalNC = rows.reduce(
      (s, r) => s + Number(r.networkCommissionAmount || 0),
      0,
    );
    const totalA = rows.reduce((s, r) => s + Number(r.amount || 0), 0);
    csvRows.push(
      [
        "",
        "",
        "",
        "Σύνολα",
        totalA.toFixed(2),
        "",
        "",
        totalDC.toFixed(2),
        totalNC.toFixed(2),
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
    a.download = "promithies.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterProductId("");
    setFilterNetworkId("");
    setFilterDealerId("");
    setPage(0);
  };
  const hasFilters =
    filterDateFrom ||
    filterDateTo ||
    filterProductId ||
    filterNetworkId ||
    filterDealerId;

  const totalDealerCommission = rows.reduce(
    (s, r) => s + Number(r.dealerCommissionAmount || 0),
    0,
  );
  const totalNetworkCommission = rows.reduce(
    (s, r) => s + Number(r.networkCommissionAmount || 0),
    0,
  );
  const totalAmount = rows.reduce((s, r) => s + Number(r.amount || 0), 0);

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
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Δίκτυο</InputLabel>
            <Select
              value={filterNetworkId}
              label="Δίκτυο"
              onChange={(e) => {
                setFilterNetworkId(e.target.value);
                setPage(0);
              }}
              sx={{ borderRadius: 1.5 }}
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
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
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
                          {r.dealerName} (
                          {Number(r.dealerCommissionPct).toFixed(0)}%)
                        </Typography>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {r.networkCommissionAmount > 0 ? (
                          <>
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
                            <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>
                              {r.networkName} (
                              {Number(r.networkCommissionPct).toFixed(0)}%)
                            </Typography>
                          </>
                        ) : (
                          <span style={{ color: "#d1d5db", fontSize: 12 }}>
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.5,
                          }}
                        >
                          <Checkbox
                            checked={r.paidDealer}
                            onChange={() => togglePaidDealer(r.id)}
                            size="small"
                            sx={{
                              p: 0.3,
                              color: "#d1d5db",
                              "&.Mui-checked": { color: "#16a34a" },
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: r.paidDealer ? "#16a34a" : "#9ca3af",
                              fontWeight: r.paidDealer ? 600 : 400,
                            }}
                          >
                            {r.paidDealer ? "Ναι" : "Όχι"}
                          </Typography>
                        </Box>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        {r.networkName ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.5,
                            }}
                          >
                            <Checkbox
                              checked={r.paidNetwork}
                              onChange={() => togglePaidNetwork(r.id)}
                              size="small"
                              sx={{
                                p: 0.3,
                                color: "#d1d5db",
                                "&.Mui-checked": { color: "#16a34a" },
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: 11,
                                color: r.paidNetwork ? "#16a34a" : "#9ca3af",
                                fontWeight: r.paidNetwork ? 600 : 400,
                              }}
                            >
                              {r.paidNetwork ? "Ναι" : "Όχι"}
                            </Typography>
                          </Box>
                        ) : (
                          <span style={{ color: "#d1d5db", fontSize: 12 }}>
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ ...tdStyle, minWidth: 120 }}>
                        <TextField
                          size="small"
                          variant="standard"
                          value={r.receipt || ""}
                          onChange={(e) => updateReceipt(r.id, e.target.value)}
                          onBlur={(e) => saveReceipt(r.id, e.target.value)}
                          placeholder="—"
                          inputProps={{
                            style: { fontSize: 12, padding: "2px 4px" },
                          }}
                          sx={{
                            width: 110,
                            "& .MuiInput-underline:before": {
                              borderBottomColor: "#e5e7eb",
                            },
                            "& .MuiInput-underline:hover:before": {
                              borderBottomColor: "#9ca3af",
                            },
                          }}
                        />
                      </td>
                      <td style={tdStyle}>
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
                    <td colSpan={4} style={tfStyle}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </Box>
        )}

        {/* Pagination + footer */}
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
            Οι εγγραφές έρχονται αυτόματα από την τιμολογιέρα · Μόνο διαγραφή,
            checkboxes και παραστατικό επιτρέπονται
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
