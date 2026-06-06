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
import { customersApi } from "../../services/customers";
import { dealersApi } from "../../services/dealers";
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

const PER_PAGE = 10;

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

// ─── Customer Detail Dialog ───────────────────────────────────────────────────
// Fetches real subscription data from the API each time a customer is opened.
function CustomerViewDialog({ customer, open, onClose }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  useEffect(() => {
    if (!open || !customer?.id) return;

    const fetchSubs = async () => {
      setLoadingSubs(true);
      try {
        const res = await customersApi.getById(customer.id);
        const apiSubs = res.data.subscriptions ?? [];

        const merged = PRODUCTS.map((p) => {
          const found = apiSubs.find((s) => s.productId === p.id);
          return {
            productId: p.id,
            description: p.description,
            type: p.type,
            active: found?.active ?? false,
            expiryDate: found?.expiryDate ?? "",
            quantity: found?.quantity ?? null,
            cost: found?.cost ?? 0,
          };
        });
        setSubscriptions(merged);
      } catch {
        setSubscriptions(
          PRODUCTS.map((p) => ({
            productId: p.id,
            description: p.description,
            type: p.type,
            active: false,
            expiryDate: "",
            quantity: null,
            cost: 0,
          })),
        );
      } finally {
        setLoadingSubs(false);
      }
    };

    fetchSubs();
  }, [open, customer?.id]);

  if (!customer) return null;

  const thStyle = {
    padding: "8px 12px",
    textAlign: "left",
    fontSize: 11,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 500,
    borderBottom: "0.5px solid #e5e7eb",
    background: "#fafafa",
  };

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
            <DetailRow label="Διεύθυνση" value={customer.address} />
            <DetailRow label="Πόλη" value={customer.city} />
            <DetailRow label="Τ.Κ." value={customer.tk} />
            <DetailRow label="Τηλέφωνο σταθερό" value={customer.phoneFixed} />
            <DetailRow label="Τηλέφωνο κινητό" value={customer.phoneMobile} />
            <DetailRow label="Email" value={customer.email} />
            <DetailRow label="Dealer" value={customer.dealerName} />
            <DetailRow label="Sub-dealer" value={customer.subDealerName} />
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
              Ενεργοποιημένα Προϊόντα
            </Typography>
            {loadingSubs ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Περιγραφή", "Ενεργό", "Λήξη / Ποσότητα", "Κόστος"].map(
                      (h) => (
                        <th key={h} style={thStyle}>
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((s, i) => (
                    <tr
                      key={s.productId}
                      style={{
                        borderBottom:
                          i < subscriptions.length - 1
                            ? "0.5px solid #f3f4f6"
                            : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "8px 12px",
                          fontSize: 13,
                          color: "#374151",
                        }}
                      >
                        {s.description}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <Chip
                          label={s.active ? "Ναι" : "Όχι"}
                          size="small"
                          sx={{
                            fontSize: 10,
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
                          : s.quantity != null
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
                        {s.cost ? `€${s.cost}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NetworkCustomersPage() {
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterDealer, setFilterDealer] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dealers, setDealers] = useState([]);

  // Load dealers of this network for the filter dropdown
  useEffect(() => {
    dealersApi
      .getAll({ size: 100 })
      .then((r) => setDealers(r.data.content))
      .catch(() => {});
  }, []);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size: PER_PAGE,
        networkId: user?.id,
        ...(search && { search }),
        ...(filterCity && { city: filterCity }),
        ...(filterDealer && { dealerId: filterDealer }),
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
  }, [page, search, filterCity, filterDealer, filterActive, user]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const clearFilters = () => {
    setSearch("");
    setFilterCity("");
    setFilterDealer("");
    setFilterActive("");
    setPage(0);
  };
  const hasFilters =
    search || filterCity || filterDealer || filterActive !== "";
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
            {total} εγγραφές — μόνο πελάτες του δικτύου σας
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
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
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Dealer</InputLabel>
            <Select
              value={filterDealer}
              label="Dealer"
              onChange={(e) => {
                setFilterDealer(e.target.value);
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
                <tr style={{ background: "#fafafa" }}>
                  {["ΑΦΜ", "Επωνυμία", "Πόλη", "Dealer", "Ενεργός", ""].map(
                    (h) => (
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
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: 40,
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: 14,
                      }}
                    >
                      Δεν βρέθηκαν πελάτες
                    </td>
                  </tr>
                ) : (
                  customers.map((c, i) => (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom:
                          i < customers.length - 1
                            ? "0.5px solid #f3f4f6"
                            : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 13,
                          fontFamily: "monospace",
                          color: "#374151",
                        }}
                      >
                        {c.afm}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#111827",
                          }}
                        >
                          {c.eponymia}
                        </Typography>
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
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 13,
                          color: "#374151",
                        }}
                      >
                        {c.dealerName || "—"}
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
