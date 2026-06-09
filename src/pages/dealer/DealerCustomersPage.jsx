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
  Snackbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { customersApi } from "../../services/customers";
import { useAuth } from "../../context/AuthContext";
import ReassignSubDealerDialog from "../../components/shared/ReassignSubDealerDialog";
import TablePagination from "../../components/shared/TablePagination";

// ── Product catalogue (must stay in sync with backend Product table) ──────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Customer Detail Dialog ────────────────────────────────────────────────────
// Fetches REAL subscription data from the API every time a customer is opened.
// Read-only — dealer cannot edit anything.
function CustomerViewDialog({ customer, open, onClose }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  useEffect(() => {
    if (!open || !customer?.id) return;

    const fetchSubs = async () => {
      setLoadingSubs(true);
      try {
        const res = await customersApi.getSubscriptions(customer.id);
        const apiSubs = res.data ?? [];

        // Merge with full PRODUCTS list so every product row always appears,
        // even if it has never been activated (active=false, cost=default).
        const merged = PRODUCTS.map((p) => {
          const found = apiSubs.find((s) => s.productId === p.id);
          return {
            productId: p.id,
            description: p.description,
            type: p.type,
            active: found?.active ?? false,
            expiryDate: found?.expiryDate ?? "",
            quantity: found?.quantity ?? null,
            cost: found?.cost ?? "—",
          };
        });
        setSubscriptions(merged);
      } catch {
        // Silently fall back to empty — subscriptions are supplementary info
        setSubscriptions(
          PRODUCTS.map((p) => ({
            productId: p.id,
            description: p.description,
            type: p.type,
            active: false,
            expiryDate: "",
            quantity: null,
            cost: "—",
          })),
        );
      } finally {
        setLoadingSubs(false);
      }
    };

    fetchSubs();
  }, [open, customer?.id]);

  if (!customer) return null;

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
          alignItems: "flex-start",
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
          <IconButton size="small" onClick={onClose} sx={{ color: "#9ca3af" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* Left: identity */}
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
              Στοιχεία
            </Typography>
            <DetailRow label="Επωνυμία" value={customer.eponymia} />
            <DetailRow
              label="Νόμιμος Εκπρόσωπος"
              value={customer.nomimosEkprosopos}
            />
            <DetailRow label="Επάγγελμα" value={customer.epaggelma} />
            <DetailRow label="Δ.Ο.Υ." value={customer.doy} />
            <DetailRow label="Sub-dealer" value={customer.subDealerName} />
          </Grid>

          {/* Right: contact */}
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

          {/* Subscriptions — real data from API */}
          <Grid item xs={12}>
            <Divider sx={{ mb: 1.5 }} />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                mb: 1.5,
              }}
            >
              Ενεργοποιημένα Προϊόντα
            </Typography>

            {loadingSubs ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={22} />
              </Box>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    {[
                      "Περιγραφή",
                      "Ενεργό",
                      "Ημ. Λήξης / Ποσότητα",
                      "Κόστος",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontSize: 11,
                          color: "#9ca3af",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          borderBottom: "0.5px solid #e5e7eb",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((s) => (
                    <tr
                      key={s.productId}
                      style={{ borderBottom: "0.5px solid #f3f4f6" }}
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
                        {s.cost !== "—" ? `€${Number(s.cost).toFixed(2)}` : "—"}
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

  // ── View dialog ─────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ── Reassign dialog ─────────────────────────────────────────────────────────
  const [reassignTarget, setReassignTarget] = useState(null);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [successSnack, setSuccessSnack] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size: PER_PAGE,
        dealerId: user?.id, // backend enforces this scope server-side too
        ...(search && { search }),
        ...(filterCity && { city: filterCity }),
        ...(filterActive !== "" && { active: filterActive === "true" }),
      };
      const res = await customersApi.getAll(params);
      setCustomers(res.data.content ?? []);
      setTotal(res.data.totalElements ?? 0);
      setTotalPages(res.data.totalPages ?? 0);
    } catch {
      setError("Σφάλμα φόρτωσης πελατών");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterCity, filterActive, user?.id]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const clearFilters = () => {
    setSearch("");
    setFilterCity("");
    setFilterActive("");
    setPage(0);
  };

  // ── Open view dialog — fetch fresh customer to get latest data ──────────────
  const handleView = async (c) => {
    try {
      const res = await customersApi.getById(c.id);
      setSelected(res.data);
    } catch {
      setSelected(c); // fallback to list data if fetch fails
    }
    setDialogOpen(true);
  };

  // ── Open reassign dialog ─────────────────────────────────────────────────────
  const handleReassign = (e, c) => {
    e.stopPropagation();
    setReassignTarget(c);
    setReassignOpen(true);
  };

  return (
    <Box>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          mb: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
            Πελάτες
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.3 }}>
            Πελάτες που ανήκουν στο δίκτυό σας
          </Typography>
        </Box>
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
            placeholder="Αναζήτηση ΑΦΜ / Επωνυμία..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
            sx={{ width: 240, "& .MuiInputBase-root": { fontSize: 13 } }}
          />

          <TextField
            size="small"
            placeholder="Πόλη"
            value={filterCity}
            onChange={(e) => {
              setFilterCity(e.target.value);
              setPage(0);
            }}
            sx={{ width: 140, "& .MuiInputBase-root": { fontSize: 13 } }}
          />

          <FormControl size="small" sx={{ width: 130 }}>
            <InputLabel sx={{ fontSize: 13 }}>Ενεργός</InputLabel>
            <Select
              value={filterActive}
              label="Ενεργός"
              onChange={(e) => {
                setFilterActive(e.target.value);
                setPage(0);
              }}
              sx={{ fontSize: 13 }}
            >
              <MenuItem value="">Όλοι</MenuItem>
              <MenuItem value="true">Ναι</MenuItem>
              <MenuItem value="false">Όχι</MenuItem>
            </Select>
          </FormControl>

          {(search || filterCity || filterActive) && (
            <Button
              size="small"
              onClick={clearFilters}
              sx={{ fontSize: 12, color: "#6b7280", textTransform: "none" }}
            >
              Καθαρισμός
            </Button>
          )}
        </Box>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
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
                <tr style={{ background: "#fafafa" }}>
                  {["ΑΦΜ", "Επωνυμία", "Πόλη", "Sub-dealer", "Ενεργός", ""].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontSize: 11,
                          color: "#9ca3af",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
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
                        padding: "40px 16px",
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: 13,
                      }}
                    >
                      Δεν βρέθηκαν πελάτες
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
                      onClick={() => handleView(c)}
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
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 13,
                          color: "#374151",
                        }}
                      >
                        {c.subDealerName || (
                          <span style={{ color: "#d1d5db" }}>—</span>
                        )}
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
                        <Stack direction="row" spacing={0}>
                          {/* Reassign sub-dealer — dealer right per spec */}
                          <Tooltip title="Αλλαγή Sub-dealer">
                            <IconButton
                              size="small"
                              onClick={(e) => handleReassign(e, c)}
                              sx={{
                                color: "#9ca3af",
                                "&:hover": { color: "#1d4ed8" },
                              }}
                            >
                              <SwapHorizIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          {/* View details */}
                          <Tooltip title="Προβολή">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(c);
                              }}
                              sx={{
                                color: "#9ca3af",
                                "&:hover": { color: "#1f6feb" },
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        )}

        {/* ── Pagination ───────────────────────────────────────────────────── */}
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
              ? "0 εγγραφές"
              : `${page * PER_PAGE + 1}–${Math.min((page + 1) * PER_PAGE, total)} από ${total} εγγραφές`}
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
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
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

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}
      <CustomerViewDialog
        customer={selected}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelected(null);
        }}
      />

      <ReassignSubDealerDialog
        customer={reassignTarget}
        open={reassignOpen}
        onClose={() => {
          setReassignOpen(false);
          setReassignTarget(null);
        }}
        onSuccess={() => {
          setSuccessSnack(true);
          fetchCustomers(); // refresh the list so the new sub-dealer name shows immediately
        }}
      />

      <Snackbar
        open={successSnack}
        autoHideDuration={3000}
        onClose={() => setSuccessSnack(false)}
        message="Ο sub-dealer άλλαξε επιτυχώς"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
