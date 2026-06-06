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
  Avatar,
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
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import { subdealersApi } from "../../services/subdealers";
import { commissionsApi } from "../../services/commissions";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../../components/shared/ConfirmDialog";

const PRODUCTS = [
  { id: 1, description: "Συνδρομή εφαρμογής", defaultPrice: 120 },
  { id: 2, description: "Ενεργός Πάροχος ΗΤ", defaultPrice: 100 },
  { id: 3, description: "Σύνδεση POS", defaultPrice: 50 },
  { id: 4, description: "Άδεια mobile App", defaultPrice: 100 },
  { id: 5, description: "Σύνδεση WooCommerce", defaultPrice: 200 },
  { id: 6, description: "Ενεργά SMS", defaultPrice: 30 },
  { id: 7, description: "Ενεργά email", defaultPrice: 20 },
  { id: 8, description: "Ψηφιακό Πελατολόγιο", defaultPrice: 50 },
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

// ─── SubDealer View Dialog ─────────────────────────────────────
function SubDealerViewDialog({ subdealer, open, onClose }) {
  const [commissions, setCommissions] = useState([]);
  const [loadingComm, setLoadingComm] = useState(false);

  useEffect(() => {
    if (!open || !subdealer?.id) return;

    const load = async () => {
      setLoadingComm(true);
      try {
        const res = await commissionsApi.getByEntity("SUBDEALER", subdealer.id);
        const apiRows = res.data.commissions ?? [];

        const merged = PRODUCTS.map((p) => {
          const found = apiRows.find((c) => c.productId === p.id);
          return {
            productId: p.id,
            description: p.description,
            defaultPrice: p.defaultPrice,
            percentage: found?.percentage ?? null,
            salePrice: found?.salePrice ?? null,
          };
        });
        setCommissions(merged);
      } catch {
        setCommissions(
          PRODUCTS.map((p) => ({
            productId: p.id,
            description: p.description,
            defaultPrice: p.defaultPrice,
            percentage: null,
            salePrice: null,
          })),
        );
      } finally {
        setLoadingComm(false);
      }
    };

    load();
  }, [open, subdealer?.id]);

  if (!subdealer) return null;

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
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              background: "#fef3c7",
              color: "#d97706",
              width: 40,
              height: 40,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {subdealer.eponymia?.charAt(0)}
          </Avatar>
          <Box>
            <Typography
              sx={{ fontSize: 16, fontWeight: 600, color: "#111827" }}
            >
              {subdealer.eponymia}
            </Typography>
            <Typography
              sx={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}
            >
              ID: {subdealer.id}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
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
            <DetailRow label="ID" value={subdealer.id} />
            <DetailRow label="ΑΦΜ" value={subdealer.afm} />
            <DetailRow label="Επωνυμία" value={subdealer.eponymia} />
            <DetailRow
              label="Νόμιμος εκπρόσωπος"
              value={subdealer.nomimosEkprosopos}
            />
            <DetailRow label="Επάγγελμα" value={subdealer.epaggelma} />
            <DetailRow label="Δ.Ο.Υ." value={subdealer.doy} />
            <DetailRow label="Διεύθυνση" value={subdealer.address} />
            <DetailRow label="Πόλη" value={subdealer.city} />
            <DetailRow label="Τ.Κ." value={subdealer.tk} />
            <DetailRow label="Τηλέφωνο σταθερό" value={subdealer.phoneFixed} />
            <DetailRow label="Τηλέφωνο κινητό" value={subdealer.phoneMobile} />
            <DetailRow label="Email" value={subdealer.email} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <LockIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Προμήθειες (μόνο προβολή)
              </Typography>
            </Box>
            {loadingComm ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Περιγραφή</th>
                    <th style={thStyle}>Προμήθεια %</th>
                    <th style={thStyle}>Τιμή πώλησης</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c, i) => (
                    <tr
                      key={c.productId}
                      style={{
                        borderBottom:
                          i < commissions.length - 1
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
                        {c.description}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        {c.percentage !== null ? (
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#111827",
                            }}
                          >
                            {Number(c.percentage).toFixed(1)}%
                          </Typography>
                        ) : (
                          <Typography sx={{ fontSize: 13, color: "#d1d5db" }}>
                            —
                          </Typography>
                        )}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        {c.salePrice !== null ? (
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 13,
                                fontFamily: "monospace",
                                fontWeight: 600,
                                color: "#111827",
                              }}
                            >
                              €{Number(c.salePrice).toFixed(2)}
                            </Typography>
                            <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>
                              από €{c.defaultPrice} τιμοκαταλόγου
                            </Typography>
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: 13, color: "#d1d5db" }}>
                            —
                          </Typography>
                        )}
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

// ─── Main Page ─────────────────────────────────────────────────
export default function DealerSubDealersPage() {
  const { user } = useAuth();

  const [subDealers, setSubDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ── Delete state ────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorSnack, setErrorSnack] = useState("");

  const PER_PAGE = 10;

  const fetchSubDealers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size: PER_PAGE,
        dealerId: user?.id,
        ...(search && { search }),
        ...(filterCity && { city: filterCity }),
      };
      const res = await subdealersApi.getAll(params);
      setSubDealers(res.data.content);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Σφάλμα φόρτωσης δεδομένων");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterCity, user]);

  useEffect(() => {
    fetchSubDealers();
  }, [fetchSubDealers]);

  // ── Delete handler ───────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await subdealersApi.delete(deleteTarget);
      setDeleteTarget(null);
      fetchSubDealers();
    } catch (err) {
      setDeleteTarget(null);
      setErrorSnack(err.response?.data?.error || "Σφάλμα διαγραφής");
    } finally {
      setDeleteLoading(false);
    }
  };

  const cities = [...new Set(subDealers.map((s) => s.city).filter(Boolean))];

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
            Sub-dealer
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
            {total} εγγραφές — μόνο δικοί σας sub-dealers
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
        <Stack direction="row" spacing={1.5} alignItems="center">
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
                  {["ΑΦΜ", "Επωνυμία", "Πόλη", ""].map((h) => (
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
                {subDealers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: 40,
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: 14,
                      }}
                    >
                      Δεν βρέθηκαν sub-dealers
                    </td>
                  </tr>
                ) : (
                  subDealers.map((s, i) => (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom:
                          i < subDealers.length - 1
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
                        {s.afm}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              background: "#fef3c7",
                              color: "#d97706",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {s.eponymia?.charAt(0)}
                          </Avatar>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#111827",
                            }}
                          >
                            {s.eponymia}
                          </Typography>
                        </Box>
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 13,
                          color: "#374151",
                        }}
                      >
                        {s.city}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Tooltip title="Προβολή">
                          <IconButton
                            size="small"
                            sx={{
                              color: "#9ca3af",
                              "&:hover": { color: "#1f6feb" },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(s);
                              setDialogOpen(true);
                            }}
                          >
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={
                            s.totalCustomers > 0
                              ? "Δεν μπορεί να διαγραφεί — έχει πελάτες"
                              : "Διαγραφή"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              disabled={s.totalCustomers > 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(s.id);
                              }}
                              sx={{
                                color: "#9ca3af",
                                "&:hover": { color: "#ef4444" },
                                "&.Mui-disabled": { opacity: 0.3 },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </span>
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

      <SubDealerViewDialog
        subdealer={selected}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Διαγραφή sub-dealer"
        message="Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον sub-dealer; Η ενέργεια δεν αναιρείται."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <Snackbar
        open={!!errorSnack}
        autoHideDuration={5000}
        onClose={() => setErrorSnack("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          onClose={() => setErrorSnack("")}
          sx={{ width: "100%" }}
        >
          {errorSnack}
        </Alert>
      </Snackbar>
    </Box>
  );
}
