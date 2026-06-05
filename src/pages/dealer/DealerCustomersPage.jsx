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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { customersApi } from "../../services/customers";
import { useAuth } from "../../context/AuthContext";

const PRODUCTS = [
  { id: 1, description: "Συνδρομή εφαρμογής", type: "DATE" },
  { id: 2, description: "Ενεργός Πάροχος ΗΤ", type: "DATE" },
  { id: 3, description: "Σύνδεση POS", type: "DATE" },
  { id: 4, description: "Άδεια mobile App", type: "DATE" },
  { id: 5, description: "Σύνδεση WooCommerce", type: "DATE" },
  { id: 6, description: "Ενεργά SMS", type: "QUANTITY" },
  { id: 7, description: "Ενεργά email", type: "QUANTITY" },
  { id: 8, description: "Ψηφιακό Πελατολόγιο", type: "DATE" },
];

function DetailRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", py: 0.8, borderBottom: "0.5px solid #f3f4f6" }}>
      <Typography
        sx={{ fontSize: 12, color: "#9ca3af", width: 180, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 13, color: "#111827" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function CustomerViewDialog({ customer, open, onClose }) {
  if (!customer) return null;

  const subscriptions = PRODUCTS.map((p, i) => ({
    productId: p.id,
    description: p.description,
    type: p.type,
    active: [0, 1, 3, 5].includes(i),
    expiryDate: [0, 1, 3].includes(i) ? "2026-12-31" : "",
    quantity: i === 5 ? 300 : i === 6 ? 500 : null,
    cost: [120, 100, 50, 100, 200, 30, 20, 50][i],
  }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, border: "0.5px solid #e5e7eb" } }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
            {customer.eponymia}
          </Typography>
          <Typography
            sx={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}
          >
            ID: {customer.id} · ΑΦΜ: {customer.afm}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={customer.active ? "Ενεργός" : "Ανενεργός"}
            size="small"
            sx={{
              background: customer.active ? "#dcfce7" : "#fee2e2",
              color: customer.active ? "#166534" : "#991b1b",
              fontSize: 11,
            }}
          />
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                mb: 1,
              }}
            >
              Στοιχεία επιχείρησης
            </Typography>
            <DetailRow label="ID" value={customer.id} />
            <DetailRow label="ΑΦΜ" value={customer.afm} />
            <DetailRow label="Επωνυμία" value={customer.eponymia} />
            <DetailRow
              label="Νόμιμος εκπρόσωπος"
              value={customer.nomimosEkprosopos}
            />
            <DetailRow label="Επάγγελμα" value={customer.epaggelma} />
            <DetailRow label="Δ.Ο.Υ." value={customer.doy} />
            <DetailRow
              label="Ενεργός"
              value={customer.active ? "Ναι" : "Όχι"}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                mb: 1,
              }}
            >
              Επικοινωνία
            </Typography>
            <DetailRow label="Διεύθυνση" value={customer.address} />
            <DetailRow label="Πόλη" value={customer.city} />
            <DetailRow label="Τ.Κ." value={customer.tk} />
            <DetailRow label="Σταθερό" value={customer.phoneFixed} />
            <DetailRow label="Κινητό" value={customer.phoneMobile} />
            <DetailRow label="Email" value={customer.email} />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ mb: 1.5 }} />
            <DetailRow label="Sub-dealer" value={customer.subDealerName} />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ mb: 1.5 }} />
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Ενεργοποιημένα προϊόντα
              </Typography>
              <Tooltip title="Ενημερώνεται από την τιμολογιέρα">
                <InfoOutlinedIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
              </Tooltip>
            </Box>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {[
                    "#",
                    "Περιγραφή",
                    "Ενεργοποιημένο",
                    "Ημερ. Λήξης / Ποσότητα",
                    "Κόστος",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        fontSize: 11,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontWeight: 500,
                        borderBottom: "0.5px solid #e5e7eb",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s, i) => (
                  <tr
                    key={s.productId}
                    style={{
                      borderBottom: "0.5px solid #f3f4f6",
                      background: s.active ? "#f0fdf4" : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "8px 12px",
                        fontSize: 12,
                        color: "#9ca3af",
                        fontFamily: "monospace",
                      }}
                    >
                      {i + 1}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        fontSize: 13,
                        color: "#111827",
                        fontWeight: s.active ? 500 : 400,
                      }}
                    >
                      {s.description}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <Chip
                        label={s.active ? "Ναι" : "Όχι"}
                        size="small"
                        sx={{
                          fontSize: 11,
                          height: 20,
                          background: s.active ? "#dcfce7" : "#f3f4f6",
                          color: s.active ? "#166534" : "#6b7280",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        fontSize: 13,
                        color: "#374151",
                      }}
                    >
                      {s.type === "DATE"
                        ? s.expiryDate
                          ? new Date(s.expiryDate).toLocaleDateString("el-GR")
                          : "—"
                        : s.quantity
                          ? `${s.quantity}`
                          : "—"}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        fontSize: 13,
                        fontFamily: "monospace",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      €{s.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: "0.5px solid #e5e7eb" }}>
        <Button size="small" onClick={onClose} sx={{ color: "#6b7280" }}>
          Κλείσιμο
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function DealerCustomersPage() {
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const PER_PAGE = 10;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size: PER_PAGE,
        dealerId: user?.id, // ΜΟΝΟ πελάτες αυτού του dealer
        ...(search && { search }),
        ...(filterCity && { city: filterCity }),
        ...(filterActive !== "" && { active: filterActive }),
      };
      const res = await customersApi.getAll(params);
      setCustomers(res.data.content);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Σφάλμα φόρτωσης δεδομένων");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterCity, filterActive, user]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const clearFilters = () => {
    setSearch("");
    setFilterCity("");
    setFilterActive("");
    setPage(0);
  };
  const hasFilters = search || filterCity || filterActive !== "";
  const cities = [...new Set(customers.map((c) => c.city).filter(Boolean))];

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
            Πελάτες
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
            {total} εγγραφές — μόνο δικοί σας πελάτες
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
            placeholder="Αναζήτηση ΑΦΜ, επωνυμία..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            sx={{ width: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Πόλη</InputLabel>
            <Select
              value={filterCity}
              label="Πόλη"
              onChange={(e) => {
                setFilterCity(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Όλες</MenuItem>
              {cities.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Ενεργός</InputLabel>
            <Select
              value={filterActive}
              label="Ενεργός"
              onChange={(e) => {
                setFilterActive(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Όλοι</MenuItem>
              <MenuItem value="true">Ναι</MenuItem>
              <MenuItem value="false">Όχι</MenuItem>
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
                <tr style={{ background: "#fafafa" }}>
                  {["ΑΦΜ", "Επωνυμία", "Πόλη", "Ενεργός", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontWeight: 500,
                        borderBottom: "0.5px solid #e5e7eb",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
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
                  customers.map((c) => (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: "0.5px solid #f3f4f6",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                      onClick={() => {
                        setSelected(c);
                        setDialogOpen(true);
                      }}
                    >
                      <td
                        style={{
                          padding: "11px 16px",
                          fontFamily: "monospace",
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        {c.afm}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#111827",
                        }}
                      >
                        {c.eponymia}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 13,
                          color: "#374151",
                        }}
                      >
                        {c.city}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Chip
                          label={c.active ? "Ναι" : "Όχι"}
                          size="small"
                          sx={{
                            fontSize: 11,
                            height: 22,
                            background: c.active ? "#dcfce7" : "#fee2e2",
                            color: c.active ? "#166534" : "#991b1b",
                          }}
                        />
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Tooltip title="Προβολή">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(c);
                              setDialogOpen(true);
                            }}
                            sx={{
                              color: "#9ca3af",
                              "&:hover": { color: "#1f6feb" },
                            }}
                          >
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        )}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: "0.5px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
            {total === 0
              ? "0"
              : `${page * PER_PAGE + 1}–${Math.min((page + 1) * PER_PAGE, total)}`}{" "}
            από {total} εγγραφές
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

      <CustomerViewDialog
        customer={selected}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
}
