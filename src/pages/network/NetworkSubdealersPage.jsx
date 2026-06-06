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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import { subdealersApi } from "../../services/subdealers";
import { commissionsApi } from "../../services/commissions";
import { useAuth } from "../../context/AuthContext";

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

// ─── SubDealer View Dialog ────────────────────────────────────────────────────
// Fetches real commissions from the API when a subdealer is opened.
// Network can only view — read-only.
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

        // Merge with full PRODUCTS list so all 8 rows always appear
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
        // On error show empty rows — no mock data
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
          {/* Left: entity details */}
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
            <DetailRow label="Διεύθυνση" value={subdealer.address} />
            <DetailRow label="Πόλη" value={subdealer.city} />
            <DetailRow label="Τ.Κ." value={subdealer.tk} />
            <DetailRow label="Σταθερό" value={subdealer.phoneFixed} />
            <DetailRow label="Κινητό" value={subdealer.phoneMobile} />
            <DetailRow label="Email" value={subdealer.email} />
          </Grid>

          {/* Commissions — real data from API */}
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
                Προμήθειες
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LockIcon sx={{ fontSize: 13, color: "#9ca3af" }} />
                <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
                  Μόνο προβολή
                </Typography>
              </Box>
            </Box>

            {loadingComm ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Περιγραφή</th>
                    <th style={{ ...thStyle, width: 160 }}>Προμήθεια %</th>
                    <th style={{ ...thStyle, width: 160, textAlign: "right" }}>
                      Τιμή Πώλησης
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c, i) => (
                    <tr
                      key={c.productId}
                      style={{
                        borderBottom: "0.5px solid #f3f4f6",
                        background: "#fafafa",
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
                          color: "#374151",
                        }}
                      >
                        {c.description}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        {c.percentage != null ? (
                          <Chip
                            label={`${Number(c.percentage).toFixed(1)}%`}
                            size="small"
                            sx={{
                              fontSize: 11,
                              height: 22,
                              background: "#fef3c7",
                              color: "#d97706",
                              fontFamily: "monospace",
                              fontWeight: 700,
                            }}
                          />
                        ) : (
                          <Typography sx={{ fontSize: 12, color: "#d1d5db" }}>
                            —
                          </Typography>
                        )}
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>
                        {c.salePrice != null ? (
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NetworkSubdealersPage() {
  const { user } = useAuth();

  const [subdealers, setSubdealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchSubdealers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size: PER_PAGE,
        networkId: user?.id,
        ...(search && { search }),
        ...(filterCity && { city: filterCity }),
      };
      const res = await subdealersApi.getAll(params);
      setSubdealers(res.data.content);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Σφάλμα φόρτωσης δεδομένων");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterCity, user]);

  useEffect(() => {
    fetchSubdealers();
  }, [fetchSubdealers]);

  const clearFilters = () => {
    setSearch("");
    setFilterCity("");
    setPage(0);
  };
  const hasFilters = search || filterCity;
  const cities = [...new Set(subdealers.map((s) => s.city).filter(Boolean))];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
          Sub-dealers
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
          {total} εγγραφές — μόνο sub-dealers του δικτύου σας · Μόνο ανάγνωση
        </Typography>
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
                  {["ΑΦΜ", "Επωνυμία", "Πόλη", "Dealer", ""].map((h) => (
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
                {subdealers.length === 0 ? (
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
                      Δεν βρέθηκαν sub-dealers
                    </td>
                  </tr>
                ) : (
                  subdealers.map((s, i) => (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom:
                          i < subdealers.length - 1
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
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#111827",
                          }}
                        >
                          {s.eponymia}
                        </Typography>
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
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 13,
                          color: "#374151",
                        }}
                      >
                        {s.dealerName || "—"}
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        )}

        {/* Pagination */}
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
    </Box>
  );
}
